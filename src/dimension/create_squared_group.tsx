import { create_kozane } from "../API/add_kozane";
import { TItem } from "../Global/TItem";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { create_gyazo_item } from "../utils/add_gyazo_item";
import { url_to_text } from "../utils/url_to_text";
import { create_squared_position } from "./create_squared_position";
import { TWorldCoord } from "./world_to_screen";

const RE_IMAGE1 = /\[(https:\/\/gyazo\.com\/[^\]]+)\]/g;
const RE_IMAGE2 = /\[(http.*[^\]]+\.png)\]/g;

const process_images_on_one_line = (text: string, position: TWorldCoord) => {
  const result = [];

  for (let match of text.matchAll(RE_IMAGE1)) {
    const url = match[1]!;
    const gyazo = create_gyazo_item(url);
    gyazo.position = position;
    result.push(gyazo);
  }
  text = text.replaceAll(RE_IMAGE1, "");

  for (let match of text.matchAll(RE_IMAGE2)) {
    const url = match[1]!;
    const gyazo = create_gyazo_item(url);
    gyazo.position = position;
    result.push(gyazo);
  }
  text = text.replaceAll(RE_IMAGE2, "");

  return { result, new_text: text };
};

export const create_squared_group = (texts: string[]) => {
  const positions = create_squared_position(texts);
  const group = new GroupItem();
  const kozane_list = [] as TItem[];
  texts.forEach((text, index) => {
    if (text === "") return;
    let kozane;
    {
      const { result, new_text } = process_images_on_one_line(
        text,
        positions[index]!
      );
      kozane_list.push(...result);
      text = new_text;
    }

    if (text === "") return;
    if (text.startsWith("https://gyazo.com/")) {
      kozane = create_gyazo_item(text);
    } else if (text.endsWith(".png")) {
      kozane = create_gyazo_item(text);
    } else if (text.startsWith("https://") || text.startsWith("http://")) {
      kozane = create_kozane(url_to_text(text), { custom: { url: text } }); // [External Kozane]
    } else {
      kozane = create_kozane(text);
    }
    kozane.position = positions[index]!;
    kozane_list.push(kozane);
  });

  console.log(kozane_list);
  updateGlobal((g) => {
    kozane_list.forEach((kozane) => {
      g.itemStore[kozane.id] = kozane;
      group.items.push(kozane.id);
    });
  });
  return group;
};
