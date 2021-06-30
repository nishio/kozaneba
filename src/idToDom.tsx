import React from "react";
import { getGlobal } from "reactn";
import { Fusen } from "./Fusen";

export const idToDom = (id: string) => {
  const item = getGlobal().itemStore[id];
  if (item.type === "piece") {
    return <Fusen value={item} />;
  } else if (item.type === "group") {
    return null;
  }
  return null;
};
