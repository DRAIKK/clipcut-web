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

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

const firebaseConfig: FirebaseOptions = {
  apiKey: readEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: readEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: readEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

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
