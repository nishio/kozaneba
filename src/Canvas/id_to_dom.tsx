import { getGlobal } from "reactn";
import { TOffset } from "../dimension/TOffset";
import { Kozane } from "../Kozane/Kozane";
import { Group } from "../Group/Group";
import { get_item } from "../Event/get_item";
import { Gyazo } from "./Gyazo";
import { Scrapbox } from "./Scrapbox";

export const id_to_dom = (id: string, offset: TOffset) => {
  // `key` required in this level, because it is item in a list
  const item = get_item(getGlobal(), id);
  if (item.type === "kozane") {
    return <Kozane value={item} offset={offset} key={item.id} />;
  } else if (item.type === "group") {
    return <Group value={item} offset={offset} key={item.id} />;
  } else if (item.type === "gyazo") {
    return <Gyazo value={item} offset={offset} key={item.id} />;
  } else if (item.type === "scrapbox") {
    return <Scrapbox value={item} offset={offset} key={item.id} />;
  }
  return null;
};
