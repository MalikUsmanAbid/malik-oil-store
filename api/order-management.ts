import type { IncomingMessage, ServerResponse } from 'node:http';
import { services, verifyCaller } from '../server/services.js';
import type { Order } from '../src/types.js';

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); res.writeHead(405).end('{}'); return; }
  let status = 401;
  try {
    const user = await verifyCaller(req);
    status = 403; if (user.admin !== true) throw new Error('Staff access required.');
    status = 400;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || !/^[\w-]{1,120}$/.test(body.orderId || '') || !['status', 'archive', 'restock', 'payment'].includes(body.action)) throw new Error('Invalid order action.');
    const { db } = services(); const ref = db.doc(`orders/${body.orderId}`);
    const result = await db.runTransaction(async tx => {
      const snapshot = await tx.get(ref); if (!snapshot.exists) throw new Error('Order not found.');
      const order = snapshot.data() as Order & { stockReturned?: boolean; accountingApplied?: boolean; archived?: boolean };
      if (body.action === 'archive') {
        if (!['Cancelled', 'Delivered'].includes(order.orderStatus)) throw new Error('Cancel or deliver this order before archiving.');
        tx.update(ref, { archived: true }); return { archived: true };
      }
      if (body.action === 'payment') {
        if (!['Paid', 'Unpaid'].includes(body.paymentStatus)) throw new Error('Invalid payment status.');
        if (order.orderStatus === 'Cancelled' && body.paymentStatus === 'Paid') throw new Error('Cancelled orders cannot be marked paid.');
        tx.update(ref, { paymentStatus: body.paymentStatus }); return { paymentStatus: body.paymentStatus };
      }
      if (body.action === 'restock' && order.orderStatus !== 'Cancelled') throw new Error('Only cancelled orders can be returned to stock.');
      const next = body.action === 'restock' ? 'Cancelled' : body.status as Order['orderStatus'];
      const transitions: Record<Order['orderStatus'], Order['orderStatus'][]> = {
        Pending: ['Pending', 'Dispatched', 'Cancelled'], Dispatched: ['Dispatched', 'Delivered', 'Cancelled'], Delivered: ['Delivered'], Cancelled: ['Cancelled']
      };
      if (!transitions[order.orderStatus]?.includes(next)) throw new Error('This order status transition is not allowed.');
      if (next === 'Cancelled' && order.paymentStatus === 'Paid') throw new Error('Record the manual refund and mark unpaid before cancelling.');
      const cancelling = next === 'Cancelled' && order.orderStatus !== 'Cancelled';
      const returnStock = next === 'Cancelled' && !order.stockReturned && (order.orderStatus === 'Pending' || body.action === 'restock');
      const productRefs = returnStock ? order.items.map(item => db.doc(`products/${item.productId}`)) : [];
      const productDocs = productRefs.length ? await tx.getAll(...productRefs) : [];
      const customerRef = cancelling && order.accountingApplied && order.ownerUid ? db.doc(`customers/${order.ownerUid}`) : null;
      const customer = customerRef ? await tx.get(customerRef) : null;
      if (productDocs.some(snapshot => !snapshot.exists)) throw new Error('A product was removed. Restore its inventory record before returning stock.');
      productDocs.forEach((snapshot, i) => tx.update(productRefs[i], { stock: snapshot.data()!.stock + order.items[i].quantity }));
      if (customerRef && customer?.exists) {
        const data = customer.data()!;
        tx.update(customerRef, { totalOrders: Math.max(0, data.totalOrders - 1), totalSpent: Math.max(0, data.totalSpent - order.total) });
      }
      tx.update(ref, { orderStatus: next, ...(returnStock ? { stockReturned: true } : {}), ...(cancelling ? { accountingApplied: false } : {}) });
      return { orderStatus: next, stockReturned: order.stockReturned || returnStock };
    });
    res.writeHead(200).end(JSON.stringify(result));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && status === 400) status = 503;
    res.writeHead(status).end(JSON.stringify({ error: status === 400 && error instanceof Error ? error.message : 'Order update failed. Please try again.' }));
  }
}
