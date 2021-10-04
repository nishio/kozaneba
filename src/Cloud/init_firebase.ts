import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

const config = {
  apiKey: "AIzaSyB0wAxxeLeHr4udunpln5jCYpGpFGn7D00",
  authDomain: "regroup-d4932.firebaseapp.com",
  projectId: "regroup-d4932",
};
firebase.initializeApp(config);

export const db = firebase.firestore();
db.settings({ ignoreUndefinedProperties: true, merge: true });

export const auth = firebase.auth();
export const GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
export type TUser = firebase.User | null;
