import * as admin from 'firebase-admin';

const APP_NAME = 'evac-admin';

function getApp(): admin.app.App {
  // Check if our specifically-named app already exists
  const existing = admin.apps.find(a => a?.name === APP_NAME);
  if (existing) return existing;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

  if (!projectId || !clientEmail || !rawKey) {
    throw new Error(
      `Firebase Admin credentials missing in environment variables. ` +
      `projectId=${!!projectId} clientEmail=${!!clientEmail} privateKey=${!!rawKey}`
    );
  }

  // Next.js dotenv may or may not expand \n — handle both cases
  const privateKey = rawKey.includes('\\n')
    ? rawKey.replace(/\\n/g, '\n')
    : rawKey;

  return admin.initializeApp(
    {
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      databaseURL,
    },
    APP_NAME
  );
}

export const adminAuth = (): admin.auth.Auth => getApp().auth();
export const adminDb = (): admin.firestore.Firestore => getApp().firestore();
export const adminRtdb = (): admin.database.Database => getApp().database();
