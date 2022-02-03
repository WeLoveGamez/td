import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  getFirestore,
  QueryDocumentSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { currentUser } from "./router";

export async function login(email: string, password: string): Promise<void> {
  const auth = getAuth();
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logout(): Promise<void> {
  const auth = getAuth();
  await signOut(auth);
  currentUser.value = null;
}

export async function register(email: string, password: string): Promise<void> {
  const auth = getAuth();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(getFirestore(), "users", userCredential.user.uid), {
    email: email,
  });
}
