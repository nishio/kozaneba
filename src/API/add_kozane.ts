import { get_center_of_screen } from "../Dialog/AddKozaneDialog/get_center_of_screen";
import { KozaneItem } from "../Kozane/KozaneItem";
import { add_item } from "./add_item";

export const add_kozane = (text: string) => {
  const kozane = new KozaneItem();
  kozane.text = text;
  kozane.position = get_center_of_screen();
  add_item(kozane);
};
