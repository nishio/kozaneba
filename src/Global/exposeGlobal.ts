import { getGlobal, setGlobal } from "reactn";
import { TKozaneba } from "../API/KozanebaAPI";
import { auth, db } from "../Cloud/init_firebase";
import { screen_to_world, world_to_screen } from "../dimension/world_to_screen";
import { closeGroup } from "../Group/closeGroup";
import { KozaneItem } from "../Kozane/KozaneItem";
import { importRegroupJSON } from "../Regroup/importRegroupJSON";
import { reset_selection } from "../Selection/reset_selection";
import { dev_log } from "../utils/dev";
import { make_items_into_new_group } from "../utils/make_items_into_new_group";
import { kintone_demo } from "./kintone_demo";
import { TKozaneItem } from "./TKozaneItem";
import { updateGlobal } from "./updateGlobal";

let isFirestoreEmulatorConnected = false;
let isAuthEmulatorConnected = false;

const tmpfunc = () => {
  dev_log("write");
  db.collection("ba").doc("foo").set({ x: "hello" })
    .then(() => {
      dev_log("OK");
    })
    .catch((err: Error) => {
      dev_log(err);
    });
};
export const toUseEmulator = () => {
  if (!isFirestoreEmulatorConnected) {
    db.useEmulator("localhost", 8080);
    isFirestoreEmulatorConnected = true;
  }
  if (!isAuthEmulatorConnected) {
    auth.useEmulator("http://localhost:9099");
    isAuthEmulatorConnected = true;
  }
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
