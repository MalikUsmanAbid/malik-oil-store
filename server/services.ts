import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getAppCheck } from 'firebase-admin/app-check';
import { createHash } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

export function services() {
  if (!getApps().length) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) throw new Error('Server credentials are missing.');
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) });
  }
  return { auth: getAuth(), db: getFirestore(process.env.FIREBASE_DATABASE_ID || '(default)') };
}
export async function verifyCaller(req: IncomingMessage) {
  const { auth } = services();
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw new Error('Sign-in required.');
  if (process.env.FIREBASE_APP_CHECK_REQUIRED === 'true') {
    const appToken = req.headers['x-firebase-appcheck'];
    if (typeof appToken !== 'string') throw new Error('App verification required.');
    await getAppCheck().verifyToken(appToken);
  }
  return auth.verifyIdToken(token, true);
}

// Persistent server limits apply across restarts and anonymous accounts.
export async function rateLimit(req: IncomingMessage, route: string, uid: string, max: number, windowMs: number) {
  const { db } = services();
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || 'local';
  const keys = [uid, ip].map(key => createHash('sha256').update(`${route}:${key}`).digest('hex'));
  await db.runTransaction(async tx => {
    const refs = keys.map(key => db.doc(`requestLimits/${key}`));
    const docs = await tx.getAll(...refs);
    const now = Date.now();
    docs.forEach(snapshot => { const data = snapshot.data(); if (data && data.until > now && data.count >= max) throw new Error('Too many requests. Please wait and try again.'); });
    docs.forEach((snapshot, i) => {
      const data = snapshot.data(); const active = data && data.until > now;
      tx.set(refs[i], { count: active ? data.count + 1 : 1, until: active ? data.until : now + windowMs });
    });
  });
}
