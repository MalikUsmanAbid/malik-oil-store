import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
const databaseId = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
  ? config.firestoreDatabaseId
  : undefined;

// Firestore rejects object fields whose value is `undefined` by default.
// Store forms contain optional fields, so ignore those fields at the SDK boundary.
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true }, databaseId);
export const auth = getAuth(app);
export default app;
