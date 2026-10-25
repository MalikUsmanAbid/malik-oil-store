import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];
if (!email || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  throw new Error('Set FIREBASE_SERVICE_ACCOUNT_JSON in your shell, then run: node scripts/set-admin.mjs admin@example.com');
}
initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) });
const auth = getAuth();
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
console.log('Store admin access granted. Sign out and sign back in to refresh the token.');
