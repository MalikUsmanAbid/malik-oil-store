import type { User } from 'firebase/auth';
import type { Product, Order, Customer, StoreSettings, DiscountCode, Review, TrackedOrder } from '../types';
import type { CheckoutRequest } from '../utils/checkout';

const cloud = () => import('./cloudService');
type Subscription = 'subscribeToProducts' | 'subscribeToOrders' | 'subscribeToCustomers' | 'subscribeToSettings' | 'subscribeToDiscountCodes' | 'subscribeToReviews' | 'subscribeToAuth';
function subscribe<T>(name: Subscription, callback: (value: T) => void, onError?: (error: Error) => void) {
  let active = true; let unsubscribe: (() => void) | undefined;
  void cloud().then(module => {
    if (active) unsubscribe = (module[name] as (cb: (value: T) => void, error?: (e: Error) => void) => () => void)(callback, onError);
  }).catch(error => { if (active) onError?.(error); });
  return () => { active = false; unsubscribe?.(); };
}
export const subscribeToProducts = (cb: (value: Product[]) => void, error?: (e: Error) => void) => subscribe('subscribeToProducts', cb, error);
export const subscribeToOrders = (cb: (value: Order[]) => void, error?: (e: Error) => void) => subscribe('subscribeToOrders', cb, error);
export const subscribeToCustomers = (cb: (value: Customer[]) => void, error?: (e: Error) => void) => subscribe('subscribeToCustomers', cb, error);
export const subscribeToSettings = (cb: (value: StoreSettings) => void, error?: (e: Error) => void) => subscribe('subscribeToSettings', cb, error);
export const subscribeToDiscountCodes = (cb: (value: DiscountCode[]) => void, error?: (e: Error) => void) => subscribe('subscribeToDiscountCodes', cb, error);
export const subscribeToReviews = (cb: (value: Review[]) => void, error?: (e: Error) => void) => subscribe('subscribeToReviews', cb, error);
export const subscribeToAuth = (cb: (value: User | null) => void) => subscribe('subscribeToAuth', cb, () => cb(null));
export const ensureCustomer = () => cloud().then(module => module.ensureCustomer());
export const placeOrder = (request: CheckoutRequest): Promise<Order> => cloud().then(module => module.placeOrder(request));
export const trackOrder = (invoice: string, phone: string): Promise<TrackedOrder | null> => cloud().then(module => module.trackOrder(invoice, phone));
export const addProduct = (product: Product) => cloud().then(module => module.addProduct(product));
export const updateProduct = (product: Product) => cloud().then(module => module.updateProduct(product));
export const deleteProduct = (id: string) => cloud().then(module => module.deleteProduct(id));
export const updateProductStock = (id: string, stock: number) => cloud().then(module => module.updateProductStock(id, stock));
export const updateProductPrice = (id: string, price: number) => cloud().then(module => module.updateProductPrice(id, price));
export const updateOrderStatus = (id: string, status: Order['orderStatus']) => cloud().then(module => module.updateOrderStatus(id, status));
export const updatePaymentStatus = (id: string, status: Order['paymentStatus']) => cloud().then(module => module.updatePaymentStatus(id, status));
export const restockCancelledOrder = (id: string) => cloud().then(module => module.restockCancelledOrder(id));
export const deleteOrder = (id: string) => cloud().then(module => module.deleteOrder(id));
export const saveStoreSettings = (settings: StoreSettings) => cloud().then(module => module.saveStoreSettings(settings));
export const saveDiscountCode = (code: DiscountCode) => cloud().then(module => module.saveDiscountCode(code));
export const deleteDiscountCode = (id: string) => cloud().then(module => module.deleteDiscountCode(id));
export const saveReview = (review: Review) => cloud().then(module => module.saveReview(review));
export const loginAdminWithEmail = (email: string, password: string) => cloud().then(module => module.loginAdminWithEmail(email, password));
export const logoutAdmin = () => cloud().then(module => module.logoutAdmin());
