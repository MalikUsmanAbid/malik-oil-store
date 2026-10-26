import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import handler from '../api/checkout';
import manageOrder from '../api/order-management';
import trackOrder from '../api/track-order';
import submitReview from '../api/reviews';
import { getAuth } from 'firebase-admin/auth';
import { rateLimit } from '../server/services';
import type { CheckoutRequest } from '../src/utils/checkout';

const projectId = 'demo-malik-oil';
before(async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('API integration tests require the Firebase emulators.');
  initializeApp({ projectId });
  await getFirestore().doc('settings/main').set({ standardShippingRate: 200, freeShippingThreshold: 3500, taxRatePercent: 18 });
});

async function buyer() {
  const response = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true })
  });
  const user = await response.json();
  assert.ok(user.idToken); return user;
}
function request(productId: string, expectedTotal = 850): CheckoutRequest {
  return { requestId: randomUUID(), items: [{ productId, quantity: 1 }], customerName: 'Test Buyer', customerEmail: '', customerPhone: '03001234567', address: 'Street 123, Test House', city: 'Samundri', province: 'Punjab', paymentMethod: 'COD', expectedTotal };
}
async function checkout(token: string, body: CheckoutRequest) {
  let status = 0; let data: any;
  const response = { setHeader() {}, writeHead(code: number) { status = code; return this; }, end(value: string) { data = JSON.parse(value); return this; } };
  await handler({ method: 'POST', headers: { authorization: `Bearer ${token}` }, body } as any, response as any);
  return { status, data };
}

async function call(endpoint: typeof handler, token: string, body: unknown) {
  let status = 0; let data: any;
  const response = { setHeader() {}, writeHead(code: number) { status = code; return this; }, end(value: string) { data = JSON.parse(value); return this; } };
  await endpoint({ method: 'POST', headers: { authorization: `Bearer ${token}` }, body } as any, response as any);
  return { status, data };
}
async function adminToken() {
  const user = await buyer();
  await getAuth().setCustomUserClaims(user.localId, { admin: true });
  const result = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/securetoken.googleapis.com/v1/token?key=fake`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: user.refreshToken })
  }).then(response => response.json());
  assert.ok(result.id_token); return result.id_token as string;
}
async function product(id: string, stock: number) {
  await getFirestore().doc(`products/${id}`).set({ name: 'Test Oil', price: 650, stock, unit: '1 Litre', category: 'Pure Oil', isActive: true });
}

test('concurrent customers cannot both buy the last unit; retry returns the same order', async () => {
  const id = 'race-' + randomUUID(); await product(id, 1);
  const users = await Promise.all([buyer(), buyer()]);
  const bodies = users.map(() => request(id));
  const results = await Promise.all(users.map((user, i) => checkout(user.idToken, bodies[i])));
  assert.deepEqual(results.map(result => result.status).sort(), [200, 400]);
  const winner = results.findIndex(result => result.status === 200);
  const retry = await checkout(users[winner].idToken, bodies[winner]);
  assert.equal(retry.status, 200); assert.equal(retry.data.id, results[winner].data.id);
  assert.equal((await getFirestore().doc(`products/${id}`).get()).data()?.stock, 0);
  assert.equal((await getFirestore().doc(`customers/${users[winner].localId}`).get()).data()?.totalOrders, 1);
  assert.equal(retry.data.paymentStatus, 'Unpaid');
  assert.equal(retry.data.customerEmail, '');
});

test('tampered totals, inactive products and unsupported payment methods do not create orders', async () => {
  const id = 'validation-' + randomUUID(); await product(id, 10); const user = await buyer();
  for (const body of [request(id, 1), { ...request(id), paymentMethod: 'Card' } as any, { ...request(id), items: [{ productId: id, quantity: -1 }] }]) {
    assert.equal((await checkout(user.idToken, body)).status, 400);
    assert.equal((await getFirestore().doc(`orders/ord-${body.requestId}`).get()).exists, false);
  }
  await getFirestore().doc(`products/${id}`).update({ isActive: false });
  assert.equal((await checkout(user.idToken, request(id))).status, 400);
  assert.equal((await getFirestore().doc(`products/${id}`).get()).data()?.stock, 10);
});

test('invalid authentication is rejected before database changes', async () => {
  const response = await checkout('invalid-token', request('none'));
  assert.equal(response.status, 401);
});

test('pending cancellation returns stock and reverses customer totals exactly once; archives retain retry records', async () => {
  const id = 'cancel-' + randomUUID(); await product(id, 5); const user = await buyer();
  const body = request(id); const saved = await checkout(user.idToken, body); assert.equal(saved.status, 200);
  const token = await adminToken(); const action = { orderId: saved.data.id, action: 'status', status: 'Cancelled' };
  assert.equal((await call(manageOrder, token, { orderId: saved.data.id, action: 'archive' })).status, 400);
  assert.equal((await call(manageOrder, user.idToken, action)).status, 403);
  assert.equal((await call(manageOrder, token, action)).status, 200);
  assert.equal((await call(manageOrder, token, action)).status, 200);
  assert.equal((await getFirestore().doc(`products/${id}`).get()).data()?.stock, 5);
  const customer = (await getFirestore().doc(`customers/${user.localId}`).get()).data();
  assert.equal(customer?.totalOrders, 0); assert.equal(customer?.totalSpent, 0);
  assert.equal((await call(manageOrder, token, { ...action, status: 'Dispatched' })).status, 400);
  assert.equal((await call(manageOrder, token, { orderId: saved.data.id, action: 'archive' })).status, 200);
  assert.equal((await checkout(user.idToken, body)).status, 200);
  assert.equal((await getFirestore().doc(`products/${id}`).get()).data()?.stock, 5);
});

test('dispatched cancellation requires a separate physical return, and a repeated return never doubles stock', async () => {
  const id = 'returned-' + randomUUID(); await product(id, 5); const user = await buyer();
  const saved = await checkout(user.idToken, request(id)); assert.equal(saved.status, 200);
  const token = await adminToken();
  const action = { orderId: saved.data.id, action: 'status', status: 'Dispatched' };
  assert.equal((await call(manageOrder, token, action)).status, 200);
  assert.equal((await call(manageOrder, token, { ...action, status: 'Cancelled' })).status, 200);
  assert.equal((await getFirestore().doc(`products/${id}`).get()).data()?.stock, 4);
  for (let i = 0; i < 2; i++) assert.equal((await call(manageOrder, token, { ...action, action: 'restock' })).status, 200);
  assert.equal((await getFirestore().doc(`products/${id}`).get()).data()?.stock, 5);
});

test('another device can track with invoice and matching phone without receiving customer identity or address', async () => {
  const id = 'tracking-' + randomUUID(); await product(id, 5); const owner = await buyer();
  const saved = await checkout(owner.idToken, request(id)); const otherDevice = await buyer();
  const result = await call(trackOrder, otherDevice.idToken, { invoice: saved.data.invoiceNo, phone: '+92 300 1234567' });
  assert.equal(result.status, 200); assert.equal(result.data.orderStatus, 'Pending');
  for (const field of ['customerPhone', 'customerEmail', 'address', 'customerName', 'ownerUid', 'requestFingerprint']) assert.equal(result.data[field], undefined);
  assert.equal((await call(trackOrder, otherDevice.idToken, { invoice: saved.data.invoiceNo, phone: '03009999999' })).data, null);
});

test('persistent limits apply to a shared source across different anonymous users', async () => {
  const req = { headers: { 'x-forwarded-for': '192.0.2.1' } } as any;
  const route = 'test-' + randomUUID();
  await rateLimit(req, route, 'one-user', 1, 60000);
  await assert.rejects(rateLimit(req, route, 'different-user', 1, 60000), /Too many requests/);
});

test('enforced App Check rejects a missing attestation before checkout writes', async () => {
  const user = await buyer(); const body = request('not-written');
  process.env.FIREBASE_APP_CHECK_REQUIRED = 'true';
  try {
    assert.equal((await checkout(user.idToken, body)).status, 401);
    assert.equal((await getFirestore().doc(`orders/ord-${body.requestId}`).get()).exists, false);
  } finally { delete process.env.FIREBASE_APP_CHECK_REQUIRED; }
});

test('paid orders cannot be cancelled without recording a refund; invalid discount minimums cannot bypass checkout', async () => {
  const id = 'paid-' + randomUUID(); await product(id, 5); const user = await buyer(); const token = await adminToken();
  const body = request(id);
  const code = 'MIN-' + randomUUID().toUpperCase();
  await getFirestore().doc(`discountCodes/${code}`).set({ code, type: 'percentage', value: 50, minOrderAmount: 1000, isActive: true });
  assert.equal((await checkout(user.idToken, { ...body, discountCode: code })).status, 400);
  const saved = await checkout(user.idToken, body); assert.equal(saved.status, 200);
  assert.equal((await call(manageOrder, token, { orderId: saved.data.id, action: 'payment', paymentStatus: 'Paid' })).status, 200);
  assert.equal((await call(manageOrder, token, { orderId: saved.data.id, action: 'status', status: 'Cancelled' })).status, 400);
  assert.equal((await getFirestore().doc(`products/${id}`).get()).data()?.stock, 4);
});

test('review API validates data, prevents another author overwriting a review and limits repeat submissions', async () => {
  const id = 'review-product-' + randomUUID(); await product(id, 5);
  const user = await buyer(); const other = await buyer();
  const review = { id: 'rev-' + randomUUID(), productId: id, author: 'Test Buyer', city: 'Samundri', comment: 'Good quality', rating: 5 };
  assert.equal((await call(submitReview, user.idToken, { ...review, rating: 99 })).status, 400);
  assert.equal((await call(submitReview, user.idToken, review)).status, 200);
  assert.equal((await call(submitReview, other.idToken, review)).status, 400);
  assert.equal((await call(submitReview, user.idToken, { ...review, id: 'rev-' + randomUUID() })).status, 200);
  assert.equal((await call(submitReview, other.idToken, { ...review, id: 'rev-' + randomUUID() })).status, 429);
});
