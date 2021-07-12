import { getGlobal, setGlobal } from "reactn";
import { importRegroupJSON } from "./importRegroupJSON";
import { updateGlobal } from "./updateGlobal";

const movidea = {
  getGlobal,
  setGlobal,
  updateGlobal,
  importRegroupJSON,
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
