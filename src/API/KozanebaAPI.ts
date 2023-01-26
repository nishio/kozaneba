import { getGlobal } from "reactn";
import { user_buttons } from "../AppBar/UserButtons";
import { save_backup_as_new, show_backup } from "../Cloud/LocalBackup";
import { get_center_of_screen } from "../dimension/get_center_of_screen";
import { get_gravity_point } from "../dimension/get_gravity_point";
import { copy_json } from "../Menu/copy_json";
import { step as step_physics, toggle_physics } from "../Physics/physics";
import {
  add_scrapbox_item,
  parse_scrapbox,
} from "../Scrapbox/add_scrapbox_item";
import { add_scrapbox_links } from "../Scrapbox/add_scrapbox_links";
import { fetch_api } from "../Scrapbox/make_scrapbox_kozane";
import { reset_selection } from "../Selection/reset_selection";
import { add_multiple_kozane } from "../utils/add_multiple_kozane";
import { fit_to_contents } from "../utils/fit_to_contents";
import { try_to_import_json } from "../utils/JSON/try_to_import_json";
import { add_kozane } from "./add_kozane";
import { constants } from "./constants";
import { get_clicked_item } from "./get_clicked_item";
import { get_item } from "./get_item";
import { get_selected_ids } from "./get_selected_ids";
import { is_touchpad } from "./is_touchpad";
import { redraw } from "./redraw";
import { show_dialog } from "./show_dialog";
import { start_tutorial } from "./start_tutorial";
import { unpin } from "./unpin";
import { update_style } from "./update_style";
import { user_menus } from "./user_menus";
import { add_arrow } from "./add_arrow";

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
  fetch_api,
  parse_scrapbox,
  toggle_physics,
  step_physics,
  unpin,
  add_arrow,

  // getter
  get_global: getGlobal,
  get_center_of_screen,
  get_clicked_item,
  get_selected_ids,
  get_gravity_point,
  get_item,
  get_num_visible_object,

  // complex values
  after_render_toppage: start_tutorial,
  user_buttons,
  user_menus,

  // experimental features
  show_backup,
  save_backup_as_new,
};

export type TKozaneba = typeof kozaneba;

export const expose_kozaneba_api = () => {
  window.kozaneba = kozaneba;
};
