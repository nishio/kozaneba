import { getGlobal, setGlobal } from "reactn";
import { closeGroup } from "../Group/closeGroup";
import { importRegroupJSON } from "../Regroup/importRegroupJSON";
import { screen_to_world, world_to_screen } from "../dimension/world_to_screen";
import { updateGlobal } from "./updateGlobal";
import { reset_selection } from "../Selection/reset_selection";
import { db, auth } from "../Cloud/FirestoreIO";
import { make_items_into_new_group } from "../Menu/make_items_into_new_group";
import { KozaneItem, TKozaneItem } from "../Kozane/KozaneItem";
import { TKozaneba } from "../API/KozanebaAPI";
import { physics, step } from "../Physics/physics";

const tmpfunc = () => {
  console.log("write");
  db.collection("ba")
    .doc("foo")
    .set({ x: "hello" })
    .then(() => {
      console.log("OK");
    })
    .catch((err) => {
      console.log(err);
    });
};
export const toUseEmulator = () => {
  db.settings({ experimentalForceLongPolling: true });
  db.useEmulator("localhost", 8080);
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

const debug = {};

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
  window.debug.step = step;
  window.debug.physics = physics;
};
