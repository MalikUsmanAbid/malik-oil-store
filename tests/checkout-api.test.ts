import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import handler from '../api/checkout';
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
