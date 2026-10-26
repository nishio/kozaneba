import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";

const config = {
  apiKey: "AIzaSyB0wAxxeLeHr4udunpln5jCYpGpFGn7D00",
  authDomain: "regroup-d4932.firebaseapp.com",
  projectId: "regroup-d4932",
  storageBucket: "regroup-d4932.firebasestorage.app",
};

firebase.initializeApp(config);

export const db = firebase.firestore();
db.settings({ ignoreUndefinedProperties: true, merge: true });

export const auth = firebase.auth();
export const storage = firebase.storage();
export const GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
export type TUser = firebase.User | null;
