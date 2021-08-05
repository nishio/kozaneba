import { getGlobal, setGlobal } from "reactn";
import { closeGroup } from "../Group/closeGroup";
import { importRegroupJSON } from "../Regroup/importRegroupJSON";
import { screen_to_world, world_to_screen } from "../dimension/world_to_screen";
import { updateGlobal } from "./updateGlobal";
import { reset_selection } from "../Selection/reset_selection";
import { db, auth } from "../Cloud/FirestoreIO";

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
  tmpfunc,
};

export type TMovidea = typeof movidea;
const debug = {};

declare global {
  interface Window {
    debug: any;
    movidea: TMovidea;
  }
}

export const exposeGlobal = () => {
  window.movidea = movidea;
  window.debug = debug;
};
