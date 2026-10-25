import { after, before, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, deleteDoc } from 'firebase/firestore';

let env: RulesTestEnvironment;
before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-malik-oil', firestore: { rules: readFileSync('firestore.rules', 'utf8') } });
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, 'products/p1'), { name: 'Oil', price: 650, stock: 10 });
    await setDoc(doc(db, 'orders/o1'), { ownerUid: 'buyer', orderStatus: 'Pending', paymentStatus: 'Unpaid', total: 967 });
    await setDoc(doc(db, 'customers/buyer'), { phone: '03001234567' });
  });
});
after(async () => env?.cleanup());

test('public visitors can read products but cannot alter catalog or read private data', async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(db, 'products/p1')));
  await assertFails(updateDoc(doc(db, 'products/p1'), { price: 1 }));
  await assertFails(getDocs(collection(db, 'orders')));
  await assertFails(getDocs(collection(db, 'customers')));
  await assertFails(setDoc(doc(db, 'settings/main'), { taxRatePercent: 0 }));
});
test('a signed-in customer can only read their own orders and cannot write payments or inventory', async () => {
  const db = env.authenticatedContext('buyer').firestore();
  await assertSucceeds(getDoc(doc(db, 'orders/o1')));
  await assertSucceeds(getDocs(query(collection(db, 'orders'), where('ownerUid', '==', 'buyer'))));
  await assertFails(getDocs(collection(db, 'orders')));
  await assertFails(updateDoc(doc(db, 'orders/o1'), { paymentStatus: 'Paid' }));
  await assertFails(setDoc(doc(db, 'orders/fake'), { ownerUid: 'buyer', total: 0 }));
  await assertFails(deleteDoc(doc(db, 'products/p1')));
  await assertFails(getDoc(doc(db, 'customers/buyer')));
  await assertFails(getDoc(doc(env.authenticatedContext('other').firestore(), 'orders/o1')));
});
test('only custom-claim admins manage orders; prices on existing orders are immutable', async () => {
  const db = env.authenticatedContext('staff', { admin: true }).firestore();
  await assertSucceeds(getDocs(collection(db, 'orders')));
  await assertSucceeds(getDocs(collection(db, 'customers')));
  await assertSucceeds(updateDoc(doc(db, 'products/p1'), { price: 700 }));
  await assertSucceeds(updateDoc(doc(db, 'orders/o1'), { paymentStatus: 'Paid' }));
  await assertFails(updateDoc(doc(db, 'orders/o1'), { total: 1 }));
});
test('reviews require an authenticated author and bounded rating', async () => {
  const review = { id: 'r1', productId: 'p1', author: 'Buyer', city: 'Samundri', comment: 'Good', date: '2026-10-15', rating: 5, ownerUid: 'buyer' };
  const db = env.authenticatedContext('buyer').firestore();
  await assertFails(setDoc(doc(env.unauthenticatedContext().firestore(), 'reviews/r1'), review));
  await assertFails(setDoc(doc(db, 'reviews/r1'), { ...review, rating: 100 }));
  await assertSucceeds(setDoc(doc(db, 'reviews/r1'), review));
  await assertFails(updateDoc(doc(db, 'reviews/r1'), { rating: 1 }));
});
