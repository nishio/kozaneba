// Initialize Firebase
import * as firebaseui from "firebaseui";
import { State } from "reactn/default";
import { setGlobal } from "reactn";
import { TItem } from "../Global/TItem";
import { TScrapboxItem } from "../Global/TScrapboxItem";
import { TGyazoItem } from "../Global/TGyazoItem";
import { TKozaneItem } from "../Global/TKozaneItem";
import { TGroupItem } from "../Global/TGroupItem";
import { upgrade } from "../utils/piece_to_kozane";
import { DocData, DocRef } from "./FirebaseShortTypename";
import { auth, db } from "./init_firebase";
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
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

export const load_from_server = (data: DocData): void => {};
export const save_to_server = (state: State): void => {};

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
    } else if (obj.type === "scrapbox") {
      return obj as TScrapboxItem;
    } else if (obj.type === "gyazo") {
      return obj as TGyazoItem;
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

import { collection, addDoc } from "firebase/firestore";

const add_map = (doc: DocData): Promise<DocRef> => {
  return addDoc(collection(db, "map"), doc);
};

const add_key = (docRef: DocRef): Promise<DocRef> => {
  return addDoc(collection(db, "key_to_map"), { mapname: docRef.id });
};

const _save = (doc: DocData) => add_map(doc).then(add_key);
