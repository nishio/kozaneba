// Initialize Firebase
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import * as firebaseui from "firebaseui";
import { State } from "reactn/default";
import { setGlobal } from "reactn";

const config = {
  apiKey: "AIzaSyB0wAxxeLeHr4udunpln5jCYpGpFGn7D00",
  authDomain: "regroup-d4932.firebaseapp.com",
  projectId: "regroup-d4932",
};

firebase.initializeApp(config);

export const db = firebase.firestore();
export const auth = firebase.auth();
export type TUser = firebase.User | null;
auth.onAuthStateChanged((user) => {
  setGlobal({ user });
});

export const authui = new firebaseui.auth.AuthUI(auth);

export const showCurrentUser = () => {
  console.log(auth.currentUser);
};

// types
export type DocSnap =
  firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>;

export type DocRef =
  firebase.firestore.DocumentReference<firebase.firestore.DocumentData>;

export type DocData = firebase.firestore.DocumentData;

export const load_from_server = (data: DocData): void => {};
export const save_to_server = (state: State): void => {};

export const state_to_docdate = (state: State): DocData => {
  return new DocDataV3();
};
export const docdate_to_state = (data: DocData): Partial<State> => {
  return {};
};

class DocDataV3 implements DocData {}

export const create_new_map = () => {
  const docdata = new DocDataV3();
  _save(docdata).then((docRef: DocRef) => {});
};
export const load_map = () => {};

const add_map = (doc: DocData): Promise<DocRef> => {
  return db.collection("map").add(doc);
};

const add_key = (docRef: DocRef): Promise<DocRef> => {
  return db.collection("key_to_map").add({ mapname: docRef.id });
};

const _save = (doc: DocData) => add_map(doc).then(add_key);
