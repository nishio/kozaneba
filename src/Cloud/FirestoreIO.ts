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
import { repair_nest, TNestReport } from "../utils/repair_nest";
import { dev_log } from "../utils/dev";
import { DocData, DocRef } from "./FirebaseShortTypename";
import { auth, db } from "./init_firebase";

auth.onAuthStateChanged((user) => {
  setGlobal({ user });
  if (user?.uid === "X4csZggYy1dAhcilL1FyNfjBJj12") {
    // user is NISHIO Hirokazu
    setGlobal({ show_devmenu: true });
  }
});

export const authui = new firebaseui.auth.AuthUI(auth);

export const showCurrentUser = () => {
  dev_log(auth.currentUser);
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
const is_plain_object = (x: unknown): x is { [key: string]: unknown } =>
  typeof x === "object" && x !== null && !Array.isArray(x);

const is_string_array = (x: unknown): x is string[] =>
  Array.isArray(x) && x.every((v) => typeof v === "string");

// A last_updated this far ahead of the local clock is not clock skew. Loading
// it as is would make every later edit look "old" to this client, so the
// client would stop following the ba.
export const MAX_FUTURE_LAST_UPDATED = 24 * 60 * 60 * 1000;

// A ba document is written by other users, so treat it as untrusted input.
// Only the fields that state_to_docdate writes (and firestore.rules
// valid_shape allows) come into the global state, each with its own type.
// Copying the whole document let a shared ba overwrite cloud_ba,
// is_local_change etc. of the person who opened it (finding U1).
// A field that is absent or has a wrong type is left out, so the global
// state keeps its current value (same as before for absent fields).
export const docdate_to_state = (
  data: DocData,
  now: number = Date.now()
): Partial<State> => read_doc(data, now).state;

// docdate_to_state, and what repair_nest repaired. The caller reports it
// (report_nest_repair) only when it puts the state in: a snapshot that is
// not adopted (the same version, the ack of an own save, a conflict) is
// parsed too.
export const read_doc = (
  data: DocData,
  now: number = Date.now()
): { state: Partial<State>; nest_report: TNestReport | null } => {
  const ret: Partial<State> = {};

  const itemStore = {} as { [key: string]: object };
  if (is_plain_object(data.itemStore)) {
    Object.entries(data.itemStore).forEach(([key, value]) => {
      if (key === "__proto__" || !is_plain_object(value)) return;
      itemStore[key] = to_item(value);
    });
  }
  ret.itemStore = upgrade(itemStore) as State["itemStore"];
  ret.drawOrder = (
    is_string_array(data.drawOrder) ? data.drawOrder : []
  ) as State["drawOrder"];

  const last_updated: unknown = data.last_updated;
  if (typeof last_updated === "number" && Number.isFinite(last_updated)) {
    ret.last_updated =
      last_updated > now + MAX_FUTURE_LAST_UPDATED ? now : last_updated;
  }
  if (typeof data.anyone_writable === "boolean") {
    ret.anyone_writable = data.anyone_writable;
  }
  if (typeof data.title === "string") {
    ret.title = data.title;
  }
  if (is_string_array(data.writers)) {
    ret.writers = data.writers;
  }
  if (Array.isArray(data.annotations)) {
    ret.annotations = data.annotations.filter(
      is_plain_object
    ) as unknown as State["annotations"];
  }
  if (typeof data.scrapbox === "string") {
    ret.scrapbox = data.scrapbox;
  }

  // Every load of a doc (snapshot, local backup, local draft) comes here.
  // Older clients saved broken nests (e.g. the orphan of #135); the repair
  // is not saved by itself, but with the next edit (saves send the state).
  // A drawOrder of a wrong type is not repaired: it was read as [], which
  // would make every item an orphan to delete. The items are kept unshown,
  // as before, so the doc can still be fixed by hand.
  let nest_report: TNestReport | null = null;
  if (is_string_array(data.drawOrder)) {
    const { nest, report } = repair_nest({
      itemStore: ret.itemStore,
      drawOrder: ret.drawOrder,
      annotations: ret.annotations,
    });
    nest_report = report;
    ret.itemStore = nest.itemStore;
    ret.drawOrder = nest.drawOrder;
    if (nest.annotations !== undefined) ret.annotations = nest.annotations;
  }
  return { state: ret, nest_report };
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
