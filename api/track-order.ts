import type { IncomingMessage, ServerResponse } from 'node:http';
import { rateLimit, services, verifyCaller } from '../server/services.js';

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); res.writeHead(405).end('{}'); return; }
  let status = 401;
  try {
    const user = await verifyCaller(req);
    status = 429; await rateLimit(req, 'tracking', user.uid, 20, 10 * 60 * 1000);
    status = 400;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || typeof body.invoice !== 'string' || !/^MEO-[\w-]{1,60}$/.test(body.invoice) || typeof body.phone !== 'string' || body.phone.length > 25) throw new Error('Enter your invoice and delivery phone number.');
    const normalize = (value: string) => value.replace(/\D/g, '').replace(/^0092|^92|^0/, '');
    const phone = normalize(body.phone); if (!/^3\d{9}$/.test(phone)) throw new Error('Enter a valid delivery mobile number.');
    const { db } = services();
    const docs = await db.collection('orders').where('invoiceNo', '==', body.invoice).limit(10).get();
    const order = docs.docs.map(doc => doc.data()).find(order => normalize(order.customerPhone || '') === phone);
    // Never return address, customer identity, phone, email, owner UID or internal fields.
    const result = order ? { invoiceNo: order.invoiceNo, orderDate: order.orderDate, orderStatus: order.orderStatus, paymentStatus: order.paymentStatus, items: order.items, total: order.total } : null;
    res.writeHead(200).end(JSON.stringify(result));
  } catch (error) {
    res.writeHead(status).end(JSON.stringify({ error: status === 400 && error instanceof Error ? error.message : status === 429 ? 'Too many searches. Please try again later.' : 'Tracking is unavailable. Please try again.' }));
  }
}
