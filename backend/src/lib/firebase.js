import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function parsePrivateKey(raw) {
  if (!raw) throw new Error('FIREBASE_PRIVATE_KEY is not set');

  // Some shells / CI systems wrap the value in extra quotes — strip them.
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  // dotenv v16 interprets \n inside double-quoted values as real newlines,
  // but other loaders (CI env vars, Docker) may leave them as literal \n.
  // Replace any remaining literal \n sequences so Firebase can parse the PEM.
  return key.replace(/\\n/g, '\n');
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  });
}

export const adminAuth = getAuth();
export const db = getFirestore();
