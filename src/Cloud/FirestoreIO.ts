// Initialize Firebase
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import * as firebaseui from "firebaseui";
import { State } from "reactn/default";
import { setGlobal } from "reactn";
import { TItem } from "../Global/initializeGlobalState";

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

const item_to_object = (x: TItem) => {
  return Object.assign({}, x);
};
export const state_to_docdate = (state: State): DocData => {
  const itemStore = {} as { [key: string]: object };
  Object.entries(state.itemStore).forEach(([key, value]) => {
    itemStore[key] = item_to_object(value);
  });

  return {
    itemStore,
    drawOrder: state.drawOrder,
    lastUpdated: state.last_updated,
  };
};
export const docdate_to_state = (data: DocData): Partial<State> => {
  return data;
};
const new_docdata = () => {
  return {};
};

export const create_new_map = () => {
  const docdata = new_docdata();
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
