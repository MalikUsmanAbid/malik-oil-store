import type { DiscountCode, Product, StoreSettings } from '../types';

export type CartLine = { product: Product; quantity: number };
export interface CheckoutRequest {
  requestId: string;
  items: { productId: string; quantity: number }[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  province: string;
  discountCode?: string;
  paymentMethod: 'COD';
  expectedTotal: number;
}

export function calculateTotals(items: CartLine[], settings: StoreSettings, code?: DiscountCode) {
  const subtotal = Math.round(items.reduce((sum, line) => sum + line.product.price * line.quantity, 0));
  const valid = code?.isActive && subtotal >= (code.minOrderAmount || 0);
  const discount = valid ? Math.min(subtotal, Math.max(0, Math.round(
    code.type === 'percentage' ? subtotal * code.value / 100 : code.value
  ))) : 0;
  // Sales tax is disabled for all new orders, including stores with legacy settings.
  const tax = 0;
  const shipping = subtotal === 0 || (settings.freeShippingThreshold > 0 && subtotal - discount >= settings.freeShippingThreshold)
    ? 0 : settings.standardShippingRate;
  return { subtotal, discount, tax, shipping, total: subtotal - discount + tax + shipping };
}

export function validateCheckout(value: unknown): asserts value is CheckoutRequest {
  const data = value as CheckoutRequest;
  if (!data || typeof data !== 'object' || !/^[a-f0-9-]{36}$/i.test(data.requestId || '')) throw new Error('Invalid checkout request.');
  for (const [key, min, max] of [['customerName', 2, 100], ['address', 5, 300], ['city', 2, 100], ['province', 2, 100]] as const) {
    if (typeof data[key] !== 'string' || data[key].trim().length < min || data[key].length > max) throw new Error('Please enter valid delivery details.');
  }
  if (typeof data.customerPhone !== 'string' || !/^(?:\+92|0092|0)3\d{9}$/.test(data.customerPhone.replace(/[\s-]/g, ''))) throw new Error('Please enter a valid Pakistani mobile number.');
  if (typeof data.customerEmail !== 'string' || data.customerEmail.length > 254 || (data.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail))) throw new Error('Please enter a valid email address.');
  if (data.paymentMethod !== 'COD') throw new Error('Only Cash on Delivery is available.');
  if (!Array.isArray(data.items) || data.items.length < 1 || data.items.length > 50) throw new Error('Your cart must contain 1 to 50 products.');
  const ids = new Set<string>();
  for (const item of data.items) {
    if (!item || typeof item.productId !== 'string' || !/^[\w-]{1,100}$/.test(item.productId) || ids.has(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000) throw new Error('Invalid cart quantity or product.');
    ids.add(item.productId);
  }
  if (data.discountCode !== undefined && (typeof data.discountCode !== 'string' || data.discountCode.length > 50)) throw new Error('Invalid discount code.');
  if (!Number.isFinite(data.expectedTotal) || data.expectedTotal < 0) throw new Error('Invalid cart total.');
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
}
