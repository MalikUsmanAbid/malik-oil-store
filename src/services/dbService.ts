import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where, limit
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import type { CheckoutRequest } from '../utils/checkout';
import { Product, Order, Customer, StoreSettings, DiscountCode, Review } from '../types';
import {
  INITIAL_PRODUCTS,
  DEFAULT_STORE_SETTINGS,
  INITIAL_DISCOUNT_CODES
} from '../data/initialData';

const INITIAL_REVIEWS: Review[] = [];

// LocalStorage Helper functions for instant offline & browser persistence
function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage set item failed:', e);
  }
}

// ==========================================
// 2. REAL-TIME SUBSCRIBERS (OBSERVERS)
// ==========================================

export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = collection(db, 'products');
  return onSnapshot(
    q,
    snapshot => {
      const prods: Product[] = [];
      snapshot.forEach(docSnap => {
        prods.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      setLocal('malik_oil_products', prods);
      onData(prods);
    },
    err => {
      console.error('Error listening to products:', err);
      onData(getLocal('malik_oil_products', INITIAL_PRODUCTS));
      if (onError) onError(err);
    }
  );
}

export function subscribeToOrders(
  onData: (orders: Order[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(collection(db, 'orders'), orderBy('orderDate', 'desc'));
  return onSnapshot(
    q,
    snapshot => {
      const orders: Order[] = [];
      snapshot.forEach(docSnap => {
        orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      onData(orders);
    },
    err => {
      console.error('Error listening to orders:', err);
      onData([]);
      if (onError) onError(err);
    }
  );
}

export function subscribeToCustomers(
  onData: (customers: Customer[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = collection(db, 'customers');
  return onSnapshot(
    q,
    snapshot => {
      const custs: Customer[] = [];
      snapshot.forEach(docSnap => {
        custs.push({ id: docSnap.id, ...docSnap.data() } as Customer);
      });
      onData(custs);
    },
    err => {
      console.error('Error listening to customers:', err);
      onData([]);
      if (onError) onError(err);
    }
  );
}

export function subscribeToSettings(
  onData: (settings: StoreSettings) => void,
  onError?: (err: Error) => void
): () => void {
  const docRef = doc(db, 'settings', 'main');
  return onSnapshot(
    docRef,
    docSnap => {
      if (docSnap.exists()) {
        const settings = docSnap.data() as StoreSettings;
        setLocal('malik_oil_store_settings', settings);
        onData(settings);
      } else {
        onData(getLocal('malik_oil_store_settings', DEFAULT_STORE_SETTINGS));
      }
    },
    err => {
      console.error('Error listening to store settings:', err);
      onData(getLocal('malik_oil_store_settings', DEFAULT_STORE_SETTINGS));
      if (onError) onError(err);
    }
  );
}

export function subscribeToDiscountCodes(
  onData: (codes: DiscountCode[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = collection(db, 'discountCodes');
  return onSnapshot(
    q,
    snapshot => {
      const codes: DiscountCode[] = [];
      snapshot.forEach(docSnap => {
        codes.push({ id: docSnap.id, ...docSnap.data() } as DiscountCode);
      });
      setLocal('malik_oil_discount_codes', codes);
      onData(codes);
    },
    err => {
      console.error('Error listening to discount codes:', err);
      onData([]);
      if (onError) onError(err);
    }
  );
}

export function subscribeToReviews(
  onData: (reviews: Review[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = collection(db, 'reviews');
  return onSnapshot(
    q,
    snapshot => {
      const revs: Review[] = [];
      snapshot.forEach(docSnap => {
        revs.push({ id: docSnap.id, ...docSnap.data() } as Review);
      });
      revs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setLocal('malik_oil_reviews', revs);
      onData(revs);
    },
    err => {
      console.error('Error listening to reviews:', err);
      onData([]);
      if (onError) onError(err);
    }
  );
}

// ==========================================
// 3. MUTATIONS & DATA ACTIONS
// ==========================================

export async function addProduct(product: Product): Promise<void> {
  await setDoc(doc(db, 'products', product.id), product);
  const existing = getLocal<Product[]>('malik_oil_products', INITIAL_PRODUCTS);
  setLocal('malik_oil_products', [product, ...existing.filter(p => p.id !== product.id)]);
}

export async function updateProduct(product: Product): Promise<void> {
  await setDoc(doc(db, 'products', product.id), product, { merge: true });
  const existing = getLocal<Product[]>('malik_oil_products', INITIAL_PRODUCTS);
  setLocal('malik_oil_products', existing.map(p => (p.id === product.id ? product : p)));
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, 'products', productId));
  const existing = getLocal<Product[]>('malik_oil_products', INITIAL_PRODUCTS);
  setLocal('malik_oil_products', existing.filter(p => p.id !== productId));
}

export async function updateProductStock(productId: string, newStock: number): Promise<void> {
  const stock = Math.max(0, newStock);
  await updateDoc(doc(db, 'products', productId), { stock });
  const existing = getLocal<Product[]>('malik_oil_products', INITIAL_PRODUCTS);
  setLocal('malik_oil_products', existing.map(p => (p.id === productId ? { ...p, stock } : p)));
}

export async function updateProductPrice(productId: string, newPrice: number): Promise<void> {
  await updateDoc(doc(db, 'products', productId), { price: newPrice });
  const existing = getLocal<Product[]>('malik_oil_products', INITIAL_PRODUCTS);
  setLocal('malik_oil_products', existing.map(p => (p.id === productId ? { ...p, price: newPrice } : p)));
}

let customerSignIn: Promise<User> | undefined;
export async function ensureCustomer(): Promise<User> {
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser;
  customerSignIn ??= signInAnonymously(auth).then(result => result.user).finally(() => { customerSignIn = undefined; });
  return customerSignIn;
}

export async function placeOrder(request: CheckoutRequest): Promise<Order> {
  const user = await ensureCustomer();
  const response = await fetch('/api/checkout', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + await user.getIdToken() },
    body: JSON.stringify(request)
  });
  const result = await response.json().catch(() => { throw new Error('Checkout service is unavailable. Please try again later.'); });
  if (!response.ok) {
    const error = Object.assign(new Error(result.error || 'Order could not be saved. Please try again.'), { definiteFailure: response.status >= 400 && response.status < 500 });
    throw error;
  }
  return result as Order;
}

export async function trackOrder(invoice: string): Promise<Order | null> {
  const user = await ensureCustomer();
  const result = await getDocs(query(collection(db, 'orders'), where('ownerUid', '==', user.uid), where('invoiceNo', '==', invoice), limit(1)));
  return result.empty ? null : { ...result.docs[0].data(), id: result.docs[0].id } as Order;
}

export async function updateOrderStatus(orderId: string, status: Order['orderStatus']): Promise<void> {

  try {
    const ref = doc(db, 'orders', orderId);
    await updateDoc(ref, { orderStatus: status });
  } catch (err) {
    console.warn('Firestore updateOrderStatus failed:', err);
    throw err;
  }
}

export async function updatePaymentStatus(orderId: string, status: Order['paymentStatus']): Promise<void> {

  try {
    const ref = doc(db, 'orders', orderId);
    await updateDoc(ref, { paymentStatus: status });
  } catch (err) {
    console.warn('Firestore updatePaymentStatus failed:', err);
    throw err;
  }
}

export async function deleteOrder(orderId: string): Promise<void> {

  try {
    const ref = doc(db, 'orders', orderId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn('Firestore deleteOrder failed:', err);
    throw err;
  }
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  setLocal('malik_oil_store_settings', settings);

  try {
    const ref = doc(db, 'settings', 'main');
    await setDoc(ref, settings);
    setLocal('malik_oil_store_settings', settings);
  } catch (err) {
    console.warn('Firestore saveStoreSettings failed:', err);
    throw err;
  }
}

export async function saveDiscountCode(discount: DiscountCode): Promise<void> {
  const existing = getLocal<DiscountCode[]>('malik_oil_discount_codes', INITIAL_DISCOUNT_CODES);
  const updated = [discount, ...existing.filter(d => d.id !== discount.id)];

  try {
    const ref = doc(db, 'discountCodes', discount.id);
    await setDoc(ref, discount);
    setLocal('malik_oil_discount_codes', updated);
  } catch (err) {
    console.warn('Firestore saveDiscountCode failed:', err);
    throw err;
  }
}

export async function deleteDiscountCode(discountId: string): Promise<void> {
  const existing = getLocal<DiscountCode[]>('malik_oil_discount_codes', INITIAL_DISCOUNT_CODES);
  const updated = existing.filter(d => d.id !== discountId);
  try {
    const ref = doc(db, 'discountCodes', discountId);
    await deleteDoc(ref);
    setLocal('malik_oil_discount_codes', updated);
  } catch (err) {
    console.warn('Firestore deleteDiscountCode failed:', err);
    throw err;
  }
}

export async function saveReview(review: Review): Promise<void> {
  const user = await ensureCustomer();
  const existing = getLocal<Review[]>('malik_oil_reviews', INITIAL_REVIEWS);
  const updated = [review, ...existing.filter(r => r.id !== review.id)];

  try {
    const ref = doc(db, 'reviews', review.id);
    await setDoc(ref, { ...review, ownerUid: user.uid });
    setLocal('malik_oil_reviews', updated);
  } catch (err) {
    console.warn('Firestore saveReview failed:', err);
    throw err;
  }
}

// ==========================================
// 4. AUTHENTICATION HELPERS
// ==========================================

export async function loginAdminWithEmail(email: string, pass: string): Promise<User> {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  if ((await res.user.getIdTokenResult(true)).claims.admin !== true) {
    await signOut(auth);
    throw new Error('This account does not have store admin access.');
  }
  return res.user;
}

export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  let active = true;
  const unsub = onAuthStateChanged(auth, async user => {
    try {
      const result = user ? await user.getIdTokenResult() : null;
      if (active && auth.currentUser === user) callback(result?.claims.admin === true ? user : null);
    } catch { if (active) callback(null); }
  });
  return () => { active = false; unsub(); };
}
