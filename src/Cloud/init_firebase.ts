import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, setLogLevel } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import type { User } from "firebase/auth";

const config = {
  apiKey: "AIzaSyB0wAxxeLeHr4udunpln5jCYpGpFGn7D00",
  authDomain: "regroup-d4932.firebaseapp.com",
  projectId: "regroup-d4932",
};

const app = initializeApp(config);

export const db = getFirestore(app);

// Configure Firestore settings - ignoreUndefinedProperties is no longer needed in v11

// Check if using emulator
const usingEmulator = window.location.hostname === "localhost";
if (usingEmulator) {
  connectFirestoreEmulator(db, "localhost", 8080);
  setLogLevel("debug");
}

export const auth = getAuth(app);
if (usingEmulator) {
  connectAuthEmulator(auth, "http://localhost:9099");
}

export const googleAuthProvider = new GoogleAuthProvider();
export type TUser = User | null;
