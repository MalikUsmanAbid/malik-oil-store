import { createHash } from 'node:crypto';
import { services, verifyCaller, rateLimit } from '../server/services.js';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { calculateTotals, validateCheckout } from '../src/utils/checkout.js';
import type { Order, Product, StoreSettings, DiscountCode } from '../src/types.js';

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); res.writeHead(405).end(JSON.stringify({ error: 'Method not allowed.' })); return; }
  let status = 500;
  try {
    const { auth, db } = services();
    const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    status = 401;
    if (!token) throw new Error('Please refresh and try again.');
    const identity = await verifyCaller(req);
    status = 429; await rateLimit(req, 'checkout', identity.uid, 60, 60 * 60 * 1000);
    status = 400;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (JSON.stringify(body || '').length > 20000) throw new Error('Checkout request is too large.');
    validateCheckout(body);
    const orderId = `ord-${body.requestId}`;
    const orderRef = db.doc(`orders/${orderId}`);
    const settingsRef = db.doc('settings/main');
    const rateRef = db.doc(`checkoutLimits/${identity.uid}`);
    const fingerprint = createHash('sha256').update(JSON.stringify(body)).digest('hex');
    const savedOrder = await db.runTransaction(async tx => {
      const existing = await tx.get(orderRef);
      if (existing.exists) {
        const saved = existing.data()!;
        if (saved.ownerUid !== identity.uid || saved.requestFingerprint !== fingerprint) throw new Error('Please start a new checkout.');
        const { requestFingerprint, ...order } = saved;
        return order;
      }
      const refs = body.items.map(item => db.doc(`products/${item.productId}`));
      const [settingsDoc, limitDoc, ...products] = await tx.getAll(settingsRef, rateRef, ...refs);
      if (!settingsDoc.exists) throw new Error('Store checkout is not ready. Please contact the store.');
      const now = Date.now();
      const limit = limitDoc.data();
      if (limit && now - limit.lastOrderAt < 30000) throw new Error('Please wait 30 seconds before placing another order.');
      const sameDay = limit?.day === new Date(now).toISOString().slice(0, 10);
      if (sameDay && limit.count >= 20) throw new Error('Daily order limit reached. Please contact the store.');
      const lines = products.map((snapshot, i) => {
        const product = { ...snapshot.data(), id: snapshot.id } as Product;
        if (!snapshot.exists || product.isActive === false || !Number.isFinite(product.price) || product.price < 0 || !Number.isInteger(product.stock) || product.stock < body.items[i].quantity) throw new Error('A product is unavailable or has insufficient stock. Please update your cart.');
        return { product, quantity: body.items[i].quantity };
      });
      const settings = settingsDoc.data() as StoreSettings;
      if (![settings.standardShippingRate, settings.freeShippingThreshold].every(n => Number.isFinite(n) && n >= 0)) throw new Error('Store delivery settings need attention.');
      let discount: DiscountCode | undefined;
      if (body.discountCode) {
        const codes = await tx.get(db.collection('discountCodes').where('code', '==', body.discountCode.trim().toUpperCase()).limit(1));
        discount = codes.docs[0]?.data() as DiscountCode | undefined;
        if (!discount?.isActive || !Number.isFinite(discount.value) || discount.value < 0 || (discount.type !== 'flat' && discount.type !== 'percentage')) throw new Error('This discount is no longer available.');
        const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
        if (subtotal < (discount.minOrderAmount || 0)) throw new Error('Your cart no longer meets the discount minimum.');
      }
      const totals = calculateTotals(lines, settings, discount);
      if (totals.total !== body.expectedTotal) throw new Error('Prices or delivery charges changed. Please refresh your cart and try again.');
      const customerRef = db.doc(`customers/${identity.uid}`);
      const customerDoc = await tx.get(customerRef);
      const customer = customerDoc.data();
      const order: Order = {
        id: orderId, ownerUid: identity.uid, invoiceNo: `MEO-${body.requestId.toUpperCase()}`,
        customerName: body.customerName.trim(), customerEmail: body.customerEmail.trim(), customerPhone: body.customerPhone.trim(),
        address: body.address.trim(), city: body.city.trim(), province: body.province.trim(),
        orderDate: new Date(now).toISOString(),
        items: lines.map(({ product, quantity }, i) => ({ id: `${orderId}-${i}`, productId: product.id, productName: product.name, quantity, priceAtPurchase: product.price, unit: product.unit })),
        ...totals, ...(discount ? { discountCode: discount.code } : {}),
        paymentMethod: 'COD', paymentStatus: 'Unpaid', orderStatus: 'Pending'
      };
      tx.create(orderRef, { ...order, accountingApplied: true, stockReturned: false, requestFingerprint: fingerprint });
      lines.forEach(({ product, quantity }, i) => tx.update(refs[i], { stock: product.stock - quantity }));
      tx.set(customerRef, { id: identity.uid, name: order.customerName, email: order.customerEmail, phone: order.customerPhone, address: order.address, city: order.city, totalOrders: (customer?.totalOrders || 0) + 1, totalSpent: (customer?.totalSpent || 0) + order.total, lastOrderDate: order.orderDate });
      tx.set(rateRef, { lastOrderAt: now, day: new Date(now).toISOString().slice(0, 10), count: sameDay ? limit.count + 1 : 1 });
      return order;
    });
    res.writeHead(200).end(JSON.stringify(savedOrder));
  } catch (error) {
    // A database transport failure can have an unknown commit outcome. Keep
    // the customer's request ID so a retry cannot create a second order.
    if (status === 400 && error && typeof error === 'object' && 'code' in error) status = 503;
    if (status === 500) console.error('Checkout service configuration failed.');
    const message = status === 400 && error instanceof Error && !('code' in error) ? error.message : status === 429 ? 'Too many requests. Please wait before trying again.' : status === 401 ? 'Please refresh and try again.' : 'Checkout is temporarily unavailable. Please try again later.';
    res.writeHead(status).end(JSON.stringify({ error: message }));
  }
}
