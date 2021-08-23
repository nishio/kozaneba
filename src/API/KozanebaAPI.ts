import { constants } from "../UserCustomize/UserCustomize";
import { show_dialog } from "./show_dialog";
import { start_tutorial } from "./start_tutorial";

export const kozaneba = {
  constants,
  after_render_toppage: start_tutorial,
  show_dialog,
};

export type TKozaneba = typeof kozaneba;

export const expose_kozaneba_api = () => {
  window.kozaneba = kozaneba;
};
