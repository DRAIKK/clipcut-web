import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type ClientProfile = {
  uid: string;
  fullName: string;
  email: string;
  role: string;
};

export type AuthResult =
  | { status: "client"; profile: ClientProfile }
  | { status: "barber" };

const BARBER_ROLES = new Set(["barber", "peluquero"]);
const CLIENT_ROLES = new Set(["client", "cliente"]);

function requireFirebase() {
  if (!auth || !db) throw new Error("firebase-not-configured");
  return { auth, db };
}

function normalizeRole(role: unknown) {
  return typeof role === "string" ? role.trim().toLowerCase() : "";
}

function friendlyFirebaseError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";

  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "El correo o la contraseña no son correctos.";
  }

  if (code.includes("email-already-in-use")) {
    return "Ya existe una cuenta con ese correo.";
  }

  if (code.includes("weak-password")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }

  if (code.includes("invalid-email")) {
    return "Ingresá un correo válido.";
  }

  if (code.includes("firebase-not-configured")) {
    return "La autenticación no está configurada en este entorno.";
  }

  return "No pudimos completar la acción. Intentá nuevamente.";
}

export function getAuthErrorMessage(error: unknown) {
  return friendlyFirebaseError(error);
}

export async function getOrCreateClientProfile(user: User, fullName?: string): Promise<AuthResult> {
  const { db } = requireFirebase();
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    const role = normalizeRole(data.role);

    if (BARBER_ROLES.has(role)) return { status: "barber" };

    if (CLIENT_ROLES.has(role) || !role) {
      return {
        status: "client",
        profile: {
          uid: user.uid,
          fullName: typeof data.fullName === "string" && data.fullName.trim() ? data.fullName : user.email ?? "Cliente Clipcut",
          email: typeof data.email === "string" && data.email.trim() ? data.email : user.email ?? "",
          role: role || "cliente",
        },
      };
    }

    return { status: "barber" };
  }

  const profile = {
    fullName: fullName?.trim() || user.displayName || user.email || "Cliente Clipcut",
    email: user.email ?? "",
    role: "cliente",
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, profile);

  return {
    status: "client",
    profile: {
      uid: user.uid,
      fullName: profile.fullName,
      email: profile.email,
      role: profile.role,
    },
  };
}

export async function loginClient(email: string, password: string) {
  const { auth } = requireFirebase();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return getOrCreateClientProfile(credential.user);
}

export async function registerClient(fullName: string, email: string, password: string) {
  const { auth, db } = requireFirebase();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const profile = {
    fullName: fullName.trim(),
    email: credential.user.email ?? email,
    role: "cliente",
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", credential.user.uid), profile);

  return {
    status: "client" as const,
    profile: {
      uid: credential.user.uid,
      ...profile,
      createdAt: undefined,
    },
  };
}

export async function logoutClient() {
  const { auth } = requireFirebase();
  await signOut(auth);
}
