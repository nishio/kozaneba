// Initialize Firebase
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import * as firebaseui from "firebaseui";
import { State } from "reactn/default";
import { setGlobal } from "reactn";
import { TItem } from "../Global/initializeGlobalState";
import { TKozaneItem } from "../Kozane/KozaneItem";
import { TGroupItem } from "../Group/GroupItem";
import { upgrade } from "../utils/piece_to_kozane";

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
  if (user?.uid === "X4csZggYy1dAhcilL1FyNfjBJj12") {
    // user is NISHIO Hirokazu
    setGlobal({ show_devmenu: true });
  }
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
    version: 3,
    itemStore,
    drawOrder: state.drawOrder,
    last_updated: state.last_updated,
  };
};

interface IHasType {
  type: string;
}
function hasType(x: object): x is IHasType {
  return "type" in x;
}

interface IHasItems {
  items: string[];
}
function hasItems(x: object): x is IHasItems {
  return "items" in x;
}

const to_item = (x: unknown): TItem => {
  const obj = Object.assign({}, x);
  if (hasType(obj)) {
    if (obj.type === "kozane" || obj.type === "piece") {
      return obj as TKozaneItem;
    } else if (obj.type === "group") {
      if (hasItems(obj)) {
        return obj as TGroupItem;
      }
      throw new Error(`a group has no items: ${obj}`);
    } else {
      throw new Error(`unknown type ${obj.type} on item ${obj}`);
    }
  } else {
    throw new Error();
  }
};
export const docdate_to_state = (data: DocData): Partial<State> => {
  const ret = { ...data };
  Object.entries(data.itemStore).forEach(([key, value]) => {
    ret.itemStore[key] = to_item(value);
  });
  ret.itemStore = upgrade(ret.itemStore);
  return ret;
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
