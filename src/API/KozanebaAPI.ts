import { user_buttons } from "../AppBar/UserButtons";
import { constants } from "./constants";
import { is_touchpad } from "./is_touchpad";
import { redraw } from "./redraw";
import { show_dialog } from "./show_dialog";
import { start_tutorial } from "./start_tutorial";
import { update_style } from "./update_style";
import { add_scrapbox_item, add_scrapbox_links } from "./make_scrapbox_kozane";
import { user_menus } from "./user_menus";
import { getGlobal } from "reactn";

export const kozaneba = {
  // simple values to modify
  constants,

  // commands
  show_dialog,
  start_tutorial,
  is_touchpad,
  redraw,
  update_style,
  add_scrapbox_item,
  add_scrapbox_links,

  // getter
  get_global: getGlobal,

  // complex values
  after_render_toppage: start_tutorial,
  user_buttons,
  user_menus,
};

export type TKozaneba = typeof kozaneba;

export const expose_kozaneba_api = () => {
  window.kozaneba = kozaneba;
};
