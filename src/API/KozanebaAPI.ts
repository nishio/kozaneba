import { user_buttons } from "../AppBar/UserButtons";
import { constants } from "./constants";
import { show_dialog } from "./show_dialog";
import { start_tutorial } from "./start_tutorial";
import { is_touchpad } from "./is_touchpad";

export const kozaneba = {
  constants,
  show_dialog,
  start_tutorial,
  is_touchpad,

  after_render_toppage: start_tutorial,
  user_buttons,
};

export type TKozaneba = typeof kozaneba;

export const expose_kozaneba_api = () => {
  window.kozaneba = kozaneba;
};
