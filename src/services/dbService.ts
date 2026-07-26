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
  writeBatch
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { Product, Order, Customer, StoreSettings, DiscountCode, Review } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  DEFAULT_STORE_SETTINGS,
  INITIAL_DISCOUNT_CODES
} from '../data/initialData';

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'p1',
    author: 'Haji Muhammad Yousaf',
    city: 'Samundri',
    rating: 5,
    comment: 'Khushbu bohot achi hai aur khana bilkul halka banta hai. Cholestrol ke liye behtareen hai!',
    date: '2026-07-15'
  },
  {
    id: 'rev-2',
    productId: 'p1',
    author: 'Ayesha Bibi',
    city: 'Faisalabad',
    rating: 5,
    comment: 'Pehle market se brand ka canola oil lete thay, ab direct Malik Oil se mangwate hain. Price bhi sasti hai aur khalis bhi hai.',
    date: '2026-07-10'
  },
  {
    id: 'rev-3',
    productId: 'p2',
    author: 'Chaudhary Bashir',
    city: 'Okara',
    rating: 5,
    comment: 'Bilkul asli kachi ghani sarson ka tel hai. Achar ke liye behtareen aur sar me lagane ke liye lajawab.',
    date: '2026-07-19'
  },
  {
    id: 'rev-4',
    productId: 'p2',
    author: 'Sajid Mehmood',
    city: 'Sahiwal',
    rating: 4,
    comment: 'Tel bilkul khalis hai aur khushbu bhi tez hai. Delivery thodi 1 din late hui par tel ki quality kamaal hai.',
    date: '2026-07-12'
  }
];

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
// 1. AUTO SEED & LOCALSTORAGE MIGRATION
// ==========================================

export async function initializeAndMigrateFirestore(): Promise<void> {
  try {
    const productsSnapshot = await getDocs(collection(db, 'products'));

    if (productsSnapshot.empty) {
      console.log('Firestore is empty. Starting initial seed...');

      const productsToSave: Product[] = getLocal('malik_oil_products', INITIAL_PRODUCTS);
      const ordersToSave: Order[] = getLocal('malik_oil_orders', INITIAL_ORDERS);
      const customersToSave: Customer[] = getLocal('malik_oil_customers', INITIAL_CUSTOMERS);
      const settingsToSave: StoreSettings = getLocal('malik_oil_store_settings', DEFAULT_STORE_SETTINGS);
      const discountsToSave: DiscountCode[] = getLocal('malik_oil_discount_codes', INITIAL_DISCOUNT_CODES);
      const reviewsToSave: Review[] = getLocal('malik_oil_reviews', INITIAL_REVIEWS);

      // Batch write for performance
      const batch = writeBatch(db);

      productsToSave.forEach(p => batch.set(doc(db, 'products', p.id), p));
      ordersToSave.forEach(o => batch.set(doc(db, 'orders', o.id), o));
      customersToSave.forEach(c => batch.set(doc(db, 'customers', c.id), c));
      batch.set(doc(db, 'settings', 'main'), settingsToSave);
      discountsToSave.forEach(d => batch.set(doc(db, 'discountCodes', d.id), d));
      reviewsToSave.forEach(r => batch.set(doc(db, 'reviews', r.id), r));

      await batch.commit();
      console.log('Successfully seeded data to Firestore.');
    }
  } catch (error) {
    console.error('Error during Firestore initialization:', error);
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
      if (prods.length > 0) {
        setLocal('malik_oil_products', prods);
        onData(prods);
      } else {
        onData(getLocal('malik_oil_products', INITIAL_PRODUCTS));
      }
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
      setLocal('malik_oil_orders', orders);
      onData(orders);
    },
    err => {
      console.error('Error listening to orders:', err);
      onData(getLocal('malik_oil_orders', INITIAL_ORDERS));
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
      setLocal('malik_oil_customers', custs);
      onData(custs);
    },
    err => {
      console.error('Error listening to customers:', err);
      onData(getLocal('malik_oil_customers', INITIAL_CUSTOMERS));
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
      if (codes.length > 0) {
        setLocal('malik_oil_discount_codes', codes);
        onData(codes);
      } else {
        onData(getLocal('malik_oil_discount_codes', INITIAL_DISCOUNT_CODES));
      }
    },
    err => {
      console.error('Error listening to discount codes:', err);
      onData(getLocal('malik_oil_discount_codes', INITIAL_DISCOUNT_CODES));
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
      onData(getLocal('malik_oil_reviews', INITIAL_REVIEWS));
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

export async function placeOrder(
  newOrder: Order,
  productsList: Product[],
  customersList: Customer[]
): Promise<void> {
  // Update local orders
  const existingOrders = getLocal<Order[]>('malik_oil_orders', INITIAL_ORDERS);
  const updatedOrders = [newOrder, ...existingOrders.filter(o => o.id !== newOrder.id)];
  setLocal('malik_oil_orders', updatedOrders);

  // Update local products stock
  const existingProducts = getLocal<Product[]>('malik_oil_products', INITIAL_PRODUCTS);
  const updatedProducts = existingProducts.map(p => {
    const item = newOrder.items.find(i => i.productId === p.id);
    if (item) {
      return { ...p, stock: Math.max(0, p.stock - item.quantity) };
    }
    return p;
  });
  setLocal('malik_oil_products', updatedProducts);

  try {
    const orderRef = doc(db, 'orders', newOrder.id);
    await setDoc(orderRef, newOrder);

    for (const item of newOrder.items) {
      try {
        const existingProd = productsList.find(p => p.id === item.productId);
        if (existingProd) {
          const prodRef = doc(db, 'products', item.productId);
          const updatedStock = Math.max(0, existingProd.stock - item.quantity);
          await setDoc(prodRef, { stock: updatedStock }, { merge: true });
        }
      } catch (err) {
        console.warn('Could not update product stock in Firestore:', err);
        throw err;
      }
    }
  } catch (err) {
    console.warn('Firestore placeOrder failed, saved to browser storage:', err);
    throw err;
  }
}

export async function updateOrderStatus(orderId: string, status: Order['orderStatus']): Promise<void> {
  const existingOrders = getLocal<Order[]>('malik_oil_orders', INITIAL_ORDERS);
  const updatedOrders = existingOrders.map(o => (o.id === orderId ? { ...o, orderStatus: status } : o));
  setLocal('malik_oil_orders', updatedOrders);

  try {
    const ref = doc(db, 'orders', orderId);
    await updateDoc(ref, { orderStatus: status });
  } catch (err) {
    console.warn('Firestore updateOrderStatus failed, saved to browser storage:', err);
    throw err;
  }
}

export async function updatePaymentStatus(orderId: string, status: Order['paymentStatus']): Promise<void> {
  const existingOrders = getLocal<Order[]>('malik_oil_orders', INITIAL_ORDERS);
  const updatedOrders = existingOrders.map(o => (o.id === orderId ? { ...o, paymentStatus: status } : o));
  setLocal('malik_oil_orders', updatedOrders);

  try {
    const ref = doc(db, 'orders', orderId);
    await updateDoc(ref, { paymentStatus: status });
  } catch (err) {
    console.warn('Firestore updatePaymentStatus failed, saved to browser storage:', err);
    throw err;
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  const existingOrders = getLocal<Order[]>('malik_oil_orders', INITIAL_ORDERS);
  const updatedOrders = existingOrders.filter(o => o.id !== orderId);
  setLocal('malik_oil_orders', updatedOrders);

  try {
    const ref = doc(db, 'orders', orderId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn('Firestore deleteOrder failed, removed from browser storage:', err);
    throw err;
  }
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  setLocal('malik_oil_store_settings', settings);

  try {
    const ref = doc(db, 'settings', 'main');
    await setDoc(ref, settings);
  } catch (err) {
    console.warn('Firestore saveStoreSettings failed, saved to browser storage:', err);
    throw err;
  }
}

export async function saveDiscountCode(discount: DiscountCode): Promise<void> {
  const existing = getLocal<DiscountCode[]>('malik_oil_discount_codes', INITIAL_DISCOUNT_CODES);
  const updated = [discount, ...existing.filter(d => d.id !== discount.id)];
  setLocal('malik_oil_discount_codes', updated);

  try {
    const ref = doc(db, 'discountCodes', discount.id);
    await setDoc(ref, discount);
  } catch (err) {
    console.warn('Firestore saveDiscountCode failed, saved to browser storage:', err);
    throw err;
  }
}

export async function deleteDiscountCode(discountId: string): Promise<void> {
  const existing = getLocal<DiscountCode[]>('malik_oil_discount_codes', INITIAL_DISCOUNT_CODES);
  const updated = existing.filter(d => d.id !== discountId);
  setLocal('malik_oil_discount_codes', updated);

  try {
    const ref = doc(db, 'discountCodes', discountId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn('Firestore deleteDiscountCode failed, removed from browser storage:', err);
    throw err;
  }
}

export async function saveReview(review: Review): Promise<void> {
  const existing = getLocal<Review[]>('malik_oil_reviews', INITIAL_REVIEWS);
  const updated = [review, ...existing.filter(r => r.id !== review.id)];
  setLocal('malik_oil_reviews', updated);

  try {
    const ref = doc(db, 'reviews', review.id);
    await setDoc(ref, review);
  } catch (err) {
    console.warn('Firestore saveReview failed, saved to browser storage:', err);
    throw err;
  }
}

// ==========================================
// 4. AUTHENTICATION HELPERS
// ==========================================

export async function loginAdminWithEmail(email: string, pass: string): Promise<User> {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  return res.user;
}

export async function registerAdminAccount(email: string, pass: string): Promise<User> {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  return res.user;
}

export async function loginAdminAnonymous(): Promise<User> {
  const res = await signInAnonymously(auth);
  return res.user;
}

export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
