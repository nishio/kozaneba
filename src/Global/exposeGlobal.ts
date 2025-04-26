import { getGlobal, setGlobal } from "reactn";
import { TKozaneba } from "../API/KozanebaAPI";
import { auth, db } from "../Cloud/init_firebase";
import { screen_to_world, world_to_screen } from "../dimension/world_to_screen";
import { closeGroup } from "../Group/closeGroup";
import { KozaneItem } from "../Kozane/KozaneItem";
import { importRegroupJSON } from "../Regroup/importRegroupJSON";
import { reset_selection } from "../Selection/reset_selection";
import { make_items_into_new_group } from "../utils/make_items_into_new_group";
import { kintone_demo } from "./kintone_demo";
import { TKozaneItem } from "./TKozaneItem";
import { updateGlobal } from "./updateGlobal";
import { collection, doc, setDoc, connectFirestoreEmulator } from "firebase/firestore";

const tmpfunc = () => {
  console.log("write");
  setDoc(doc(collection(db, "ba"), "foo"), { x: "hello" })
    .then(() => {
      console.log("OK");
    })
    .catch((err: Error) => {
      console.log(err);
    });
};
export const toUseEmulator = () => {
  connectFirestoreEmulator(db, "localhost", 8080);
  updateGlobal((g) => {
    g.usingFirestoreEmulator = true;
  });
};
const make_one_kozane = (value: Partial<TKozaneItem>) => {
  const kozane = new KozaneItem(value.id);
  Object.assign(kozane, value);
  updateGlobal((g) => {
    g.itemStore[kozane.id] = kozane;
    g.drawOrder.push(kozane.id);
  });
  return kozane.id;
};
const movidea = {
  getGlobal,
  setGlobal,
  updateGlobal,
  importRegroupJSON,
  closeGroup,
  world_to_screen,
  screen_to_world,
  reset_selection,
  auth,
  db,
  tmpfunc,
  toUseEmulator,
  make_items_into_new_group,
  make_one_kozane,
};

export type TMovidea = typeof movidea;

const debug: any = {};

declare global {
  interface Window {
    debug: any;
    movidea: TMovidea;
    kozaneba: TKozaneba;
  }
}

export const exposeGlobalForTest = () => {
  window.movidea = movidea;
  window.debug = debug;
  debug.kintone_demo = kintone_demo;
};
