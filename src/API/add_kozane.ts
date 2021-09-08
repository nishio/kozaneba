import { get_center_of_screen } from "../dimension/get_center_of_screen";
import { KozaneItem, TKozaneItem } from "../Kozane/KozaneItem";
import { add_item } from "./add_item";

export const add_kozane = (text: string, option: Partial<TKozaneItem> = {}) => {
  const kozane = new KozaneItem();
  kozane.text = text;
  kozane.position = get_center_of_screen();
  Object.assign(kozane, option);
  add_item(kozane);
};
