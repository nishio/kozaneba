import { getGlobal, setGlobal } from "reactn";
import { closeGroup } from "../Group/closeGroup";
import { importRegroupJSON } from "../Regroup/importRegroupJSON";
import { screen_to_world, world_to_screen } from "../dimension/world_to_screen";
import { updateGlobal } from "./updateGlobal";
import { reset_selection } from "../Selection/reset_selection";

const movidea = {
  getGlobal,
  setGlobal,
  updateGlobal,
  importRegroupJSON,
  closeGroup,
  world_to_screen,
  screen_to_world,
  reset_selection,
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
