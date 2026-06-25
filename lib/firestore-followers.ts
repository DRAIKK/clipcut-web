import { doc, getDoc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

function requireFirestore() {
  if (!db) throw new Error("Firebase no está configurado.");
  return db;
}

export async function isFollowingBarber(barberId: string, clientId: string) {
  const firestore = requireFirestore();
  const followerRef = doc(firestore, "users", barberId, "followers", clientId);
  const snapshot = await getDoc(followerRef);

  return snapshot.exists();
}

export async function followBarber(barberId: string, clientId: string) {
  const firestore = requireFirestore();
  const followerRef = doc(firestore, "users", barberId, "followers", clientId);
  const barberRef = doc(firestore, "users", barberId);

  const batch = writeBatch(firestore);

  batch.set(followerRef, {
    clientId,
    followedAt: serverTimestamp(),
  });
  batch.update(barberRef, { followersCount: increment(1) });

  await batch.commit();
}

export async function unfollowBarber(barberId: string, clientId: string) {
  const firestore = requireFirestore();
  const followerRef = doc(firestore, "users", barberId, "followers", clientId);
  const barberRef = doc(firestore, "users", barberId);

  const batch = writeBatch(firestore);

  batch.delete(followerRef);
  batch.update(barberRef, { followersCount: increment(-1) });

  await batch.commit();
}
