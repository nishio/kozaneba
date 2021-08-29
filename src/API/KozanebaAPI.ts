import { user_buttons } from "../AppBar/UserButtons";
import { TWorldCoord } from "../dimension/world_to_screen";
import { TScrapboxItem } from "../Global/initializeGlobalState";
import { create_new_itemid } from "../Kozane/create_new_itemid";
import { add_item } from "./add_item";
import { constants } from "./constants";
import { is_touchpad } from "./is_touchpad";
import { redraw } from "./redraw";
import { show_dialog } from "./show_dialog";
import { start_tutorial } from "./start_tutorial";
import { update_style } from "./update_style";

export const add_scrapbox_item_raw = (props: {
  text: string;
  url?: string;
  icon?: string;
  description?: string[];
}) => {
  const { text, icon, url, description } = props;
  const scrapbox: TScrapboxItem = {
    id: create_new_itemid(),
    type: "scrapbox",
    text: text,
    icon: icon ?? "",
    url: url ?? "",
    description: description ?? [],

    position: [0, 0] as TWorldCoord,
    scale: 1,
  };
  add_item(scrapbox);
};

export const add_scrapbox_item = (url: string) => {};

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

  // complex values
  after_render_toppage: start_tutorial,
  user_buttons,
};

export type TKozaneba = typeof kozaneba;

export const expose_kozaneba_api = () => {
  window.kozaneba = kozaneba;
};
