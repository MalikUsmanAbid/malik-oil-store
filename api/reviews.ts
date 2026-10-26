import type { IncomingMessage, ServerResponse } from 'node:http';
import { services, verifyCaller, rateLimit } from '../server/services.js';

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); res.writeHead(405).end('{}'); return; }
  let status = 401;
  try {
    const user = await verifyCaller(req); status = 400;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || typeof body.id !== 'string' || !/^rev-[a-f0-9-]{36}$/i.test(body.id) || typeof body.productId !== 'string' || !/^[\w-]{1,100}$/.test(body.productId)) throw new Error('Invalid review.');
    for (const [key, min, max] of [['author', 1, 100], ['city', 1, 100], ['comment', 1, 2000]] as const) {
      if (typeof body[key] !== 'string' || body[key].trim().length < min || body[key].length > max) throw new Error('Please enter valid review details.');
    }
    if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) throw new Error('Rating must be between 1 and 5.');
    status = 429; await rateLimit(req, 'reviews', user.uid, 3, 60 * 60 * 1000); status = 400;
    const { db } = services(); const ref = db.doc(`reviews/${body.id}`);
    await db.runTransaction(async tx => {
      const existing = await tx.get(ref);
      if (existing.exists) {
        if (existing.data()!.ownerUid !== user.uid) throw new Error('This review cannot be changed.');
        return;
      }
      const product = await tx.get(db.doc(`products/${body.productId}`));
      if (!product.exists || product.data()!.isActive === false) throw new Error('This product is unavailable.');
      tx.create(ref, { id: body.id, productId: body.productId, author: body.author.trim(), city: body.city.trim(), comment: body.comment.trim(), rating: body.rating, ownerUid: user.uid, date: new Date().toISOString() });
    });
    res.writeHead(200).end(JSON.stringify({ id: body.id }));
  } catch (error) {
    if (status === 400 && error && typeof error === 'object' && 'code' in error) status = 503;
    res.writeHead(status).end(JSON.stringify({ error: status === 400 && error instanceof Error ? error.message : status === 429 ? 'Review limit reached. Please try again later.' : 'Review could not be saved. Please try again.' }));
  }
}
