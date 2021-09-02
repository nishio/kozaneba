import { getGlobal } from "reactn";
import { fit_to_contents } from "../App/toggle_fit_to_contents";
import { try_to_import_json } from "../App/try_to_import_json";
import { user_buttons } from "../AppBar/UserButtons";
import { get_center_of_screen } from "../Dialog/AddKozaneDialog/get_center_of_screen";
import { reset_selection } from "../Selection/reset_selection";
import { add_kozane } from "./add_kozane";
import { constants } from "./constants";
import { get_clicked_item } from "./get_clicked_item";
import { get_selected_ids } from "./get_selected_ids";
import { is_touchpad } from "./is_touchpad";
import { add_scrapbox_item, add_scrapbox_links } from "./make_scrapbox_kozane";
import { redraw } from "./redraw";
import { show_dialog } from "./show_dialog";
import { start_tutorial } from "./start_tutorial";
import { update_style } from "./update_style";
import { user_menus } from "./user_menus";
import { add_multiple_kozane } from "../Dialog/AddKozaneDialog/add_multiple_kozane";
import { copy_json } from "../Menu/copy_json";
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
  try_to_import_json,
  fit_to_contents,
  reset_selection,
  add_kozane,
  add_multiple_kozane,
  copy_json,

  // getter
  get_global: getGlobal,
  get_center_of_screen,
  get_clicked_item,
  get_selected_ids,

  // complex values
  after_render_toppage: start_tutorial,
  user_buttons,
  user_menus,
};

export type TKozaneba = typeof kozaneba;

export const expose_kozaneba_api = () => {
  window.kozaneba = kozaneba;
};
