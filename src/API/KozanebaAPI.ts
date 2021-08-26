import { user_buttons } from "../AppBar/UserButtons";
import { constants } from "./constants";
import { is_touchpad } from "./is_touchpad";
import { redraw } from "./redraw";
import { show_dialog } from "./show_dialog";
import { start_tutorial } from "./start_tutorial";
import { update_style } from "./update_style";

export const kozaneba = {
  // simple values to modify
  constants,

  // commands
  show_dialog,
  start_tutorial,
  is_touchpad,
  redraw,
  update_style,

  // complex values
  after_render_toppage: start_tutorial,
  user_buttons,
};

export type TKozaneba = typeof kozaneba;

export const expose_kozaneba_api = () => {
  window.kozaneba = kozaneba;
};
