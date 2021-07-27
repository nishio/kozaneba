import { getGlobal } from "reactn";
import { TOffset } from "../dimension/TOffset";
import { Fusen } from "../Fusen/Fusen";
import { Group } from "../Group/Group";

export const id_to_dom = (id: string, offset: TOffset) => {
  const item = getGlobal().itemStore[id];
  if (item.type === "piece") {
    return <Fusen value={item} offset={offset} key={id} data-testid={id} />;
  } else if (item.type === "group") {
    return <Group value={item} offset={offset} key={id} data-testid={id} />;
  }
  return null;
};