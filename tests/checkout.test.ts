import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotals, escapeHtml, validateCheckout } from '../src/utils/checkout';
import type { CheckoutRequest } from '../src/utils/checkout';
import type { Product, StoreSettings, DiscountCode } from '../src/types';

const settings = { standardShippingRate: 200, freeShippingThreshold: 3500, taxRatePercent: 18 } as StoreSettings;
const product = { id: 'p1', price: 650, stock: 10 } as Product;
const code = { code: 'SAVE', type: 'percentage', value: 10, minOrderAmount: 1000, isActive: true } as DiscountCode;
const valid: CheckoutRequest = { requestId: 'a2fc30f9-b0c2-4bd9-b116-08bd5e6c9012', items: [{ productId: 'p1', quantity: 1 }], customerName: 'Test Customer', customerEmail: '', customerPhone: '03001234567', address: 'Test Street 123', city: 'Samundri', province: 'Punjab', paymentMethod: 'COD', expectedTotal: 850 };

test('sales tax stays zero despite legacy settings; delivery and discounts remain correct', () => {
  assert.deepEqual(calculateTotals([{ product, quantity: 1 }], settings, code), { subtotal: 650, discount: 0, tax: 0, shipping: 200, total: 850 });
  assert.deepEqual(calculateTotals([{ product, quantity: 2 }], settings, code), { subtotal: 1300, discount: 130, tax: 0, shipping: 200, total: 1370 });
  assert.equal(calculateTotals([{ product, quantity: 6 }], settings).shipping, 0);
  assert.equal(calculateTotals([{ product, quantity: 1 }], settings, { ...code, isActive: false }).discount, 0);
});

test('flat discounts cannot make totals negative', () => {
  const total = calculateTotals([{ product, quantity: 1 }], settings, { ...code, type: 'flat', value: 9999, minOrderAmount: 0 });
  assert.equal(total.discount, 650); assert.equal(total.tax, 0); assert.equal(total.total, 200);
});

test('checkout accepts an optional email without inventing an address', () => assert.doesNotThrow(() => validateCheckout(valid)));
test('checkout rejects invalid quantities, duplicate products, fake payments, invalid phones and path injection', () => {
  for (const quantity of [0, -1, 0.5, NaN, 1001]) assert.throws(() => validateCheckout({ ...valid, items: [{ productId: 'p1', quantity }] }));
  assert.throws(() => validateCheckout({ ...valid, items: [...valid.items, ...valid.items] }));
  assert.throws(() => validateCheckout({ ...valid, paymentMethod: 'Card' }));
  assert.throws(() => validateCheckout({ ...valid, customerPhone: '123' }));
  assert.throws(() => validateCheckout({ ...valid, customerEmail: 'invalid' }));
  assert.throws(() => validateCheckout({ ...valid, items: [{ productId: '../settings/main', quantity: 1 }] }));
});
test('invoice values are escaped before insertion into HTML', () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
