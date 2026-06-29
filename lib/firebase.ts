import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";
import { getStorage, type FirebaseStorage } from "firebase/storage";

type FirebaseExports = {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
  functions: Functions | null;
};

function cleanEnv(value: string | undefined) {
  return value?.trim() || undefined;
}

const firebaseConfig: FirebaseOptions = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

if (process.env.NODE_ENV === "development") {
  console.log("Firebase env check", {
    apiKey: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: Boolean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: Boolean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: Boolean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: Boolean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  });
}

const hasFirebaseCoreConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);

function createFirebase(): FirebaseExports {
  if (!hasFirebaseCoreConfig) {
    return { app: null, db: null, auth: null, storage: null, functions: null };
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

  return {
    app,
    db: getFirestore(app),
    auth: getAuth(app),
    storage: firebaseConfig.storageBucket ? getStorage(app) : null,
    functions: getFunctions(app),
  };
}

export const { app, db, auth, storage, functions } = createFirebase();
