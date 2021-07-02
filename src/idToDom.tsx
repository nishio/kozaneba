import { getGlobal } from "reactn";
import { Fusen } from "./Fusen";

import { Group } from "./Group";

export const idToDom = (id: string) => {
  const item = getGlobal().itemStore[id];
  if (item.type === "piece") {
    return <Fusen value={item} key={id} data-testid={id} />;
  } else if (item.type === "group") {
    return <Group value={item} key={id} data-testid={id} />;
  }
  return null;
};
