import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "./firebase";
import { normalizeCoordinates, type Coordinates } from "./distance";

export type ClientProfile = {
  uid: string;
  fullName: string;
  email: string;
  role: string;
  coordinates?: Coordinates;
  photoURL?: string;
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

function getRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : undefined;
}

function getCoordinateNumber(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return Number.NaN;
}

function getProfileCoordinates(data: Record<string, unknown>): Coordinates | undefined {
  const coordinateSources = [
    data,
    getRecord(data.location),
    getRecord(data.coords),
    getRecord(data.coordinates),
    getRecord(data.geo),
    getRecord(data.geoPoint),
    getRecord(data.geopoint),
  ].filter((source): source is Record<string, unknown> => Boolean(source));

  for (const source of coordinateSources) {
    const coordinates = normalizeCoordinates({
      latitude: getCoordinateNumber(source, ["lat", "latitude", "_lat"]),
      longitude: getCoordinateNumber(source, ["lng", "longitude", "lon", "_long"]),
    });

    if (coordinates) return coordinates;
  }

  return undefined;
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
          coordinates: getProfileCoordinates(data),
          photoURL: typeof data.photoURL === "string" ? data.photoURL : "",
        },
      };
    }

    return { status: "barber" };
  }

  const profile = {
    fullName: fullName?.trim() || user.displayName || user.email || "Cliente Clipcut",
    email: user.email ?? "",
    photoURL: user.photoURL ?? "",
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
      photoURL: profile.photoURL,
    },
  };
}

export async function loginClient(email: string, password: string) {
  console.log("firebase auth available", !!auth);
  console.log("login email", email);

  try {
    const { auth } = requireFirebase();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return getOrCreateClientProfile(credential.user);
  } catch (error) {
    console.error("login error", error);
    throw error;
  }
}

export async function loginWithGoogle() {
  const { auth } = requireFirebase();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const credential = await signInWithPopup(auth, provider);
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

export async function deleteClientAccount() {
  const { auth, db } = requireFirebase();
  const user = auth.currentUser;
  if (!user) throw new Error("auth/no-current-user");

  await deleteDoc(doc(db, "users", user.uid));
  await deleteUser(user);
}

export async function updateClientPhoto(file: File) {
  const { auth, db } = requireFirebase();
  if (!storage) throw new Error("firebase-not-configured");
  const user = auth.currentUser;
  if (!user) throw new Error("auth/no-current-user");

  const photoRef = ref(storage, `users/${user.uid}/profile.jpg`);
  await uploadBytes(photoRef, file, { contentType: file.type || "image/jpeg" });
  const photoURL = await getDownloadURL(photoRef);
  await updateDoc(doc(db, "users", user.uid), { photoURL });

  return photoURL;
}

export async function removeClientPhoto() {
  const { auth, db } = requireFirebase();
  const user = auth.currentUser;
  if (!user) throw new Error("auth/no-current-user");

  await updateDoc(doc(db, "users", user.uid), { photoURL: "" });
}
