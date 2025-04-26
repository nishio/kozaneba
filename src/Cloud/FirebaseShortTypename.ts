import firebase from "firebase/compat/app";

export type DocSnap = firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>;

export type DocRef = firebase.firestore.DocumentReference<firebase.firestore.DocumentData>;

export type DocData = firebase.firestore.DocumentData;
