import { getGlobal } from "reactn";
import { Fusen } from "./Fusen";

import { Group } from "./Group";
import { TOffset } from "./TOffset";

export const idToDom = (id: string, offset: TOffset) => {
  const item = getGlobal().itemStore[id];
  if (item.type === "piece") {
    return <Fusen value={item} offset={offset} key={id} data-testid={id} />;
  } else if (item.type === "group") {
    return <Group value={item} offset={offset} key={id} data-testid={id} />;
  }
  return null;
};
