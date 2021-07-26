import { getGlobal, setGlobal } from "reactn";
import { importRegroupJSON } from "./importRegroupJSON";
import { updateGlobal } from "./updateGlobal";
import { world_to_screen, screen_to_world } from "./world_to_screen";
import { closeGroup } from "./closeGroup";

const reset_selection = () => {
  updateGlobal((g) => {
    g.selected_items = [];
    g.selectionRange = { top: 0, left: 0, width: 0, height: 0 }
  })
}

const movidea = {
  getGlobal,
  setGlobal,
  updateGlobal,
  importRegroupJSON,
  closeGroup,
  world_to_screen,
  screen_to_world,
  reset_selection
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
