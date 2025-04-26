import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import type { User } from "firebase/auth";

const config = {
  apiKey: "AIzaSyB0wAxxeLeHr4udunpln5jCYpGpFGn7D00",
  authDomain: "regroup-d4932.firebaseapp.com",
  projectId: "regroup-d4932",
};

const app = initializeApp(config);

export const db = getFirestore(app);

export const auth = getAuth(app);
export { GoogleAuthProvider };
export type TUser = User | null;
