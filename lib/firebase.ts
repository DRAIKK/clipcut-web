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

const firebaseProjectId = cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) ?? "clipcut-3053d";

const firebaseConfig: FirebaseOptions = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) ?? `${firebaseProjectId}.firebaseapp.com`,
  projectId: firebaseProjectId,
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) ?? `${firebaseProjectId}.appspot.com`,
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

if (process.env.NODE_ENV === "development") {
  console.log("Firebase env check", {
    apiKey: Boolean(firebaseConfig.apiKey),
    authDomain: Boolean(firebaseConfig.authDomain),
    projectId: Boolean(firebaseConfig.projectId),
    storageBucket: Boolean(firebaseConfig.storageBucket),
    messagingSenderId: Boolean(firebaseConfig.messagingSenderId),
    appId: Boolean(firebaseConfig.appId),
  });
}

function createFirebase(): FirebaseExports {
  if (!firebaseConfig.projectId) {
    return { app: null, db: null, auth: null, storage: null, functions: null };
  }

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

  return {
    app,
    db: getFirestore(app),
    auth: getAuth(app),
    storage: getStorage(app),
    functions: getFunctions(app),
  };
}

export const { app, db, auth, storage, functions } = createFirebase();
