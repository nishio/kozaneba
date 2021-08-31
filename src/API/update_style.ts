import { CSSProperties } from "react";
import { mark_local_changed } from "../Cloud/mark_local_changed";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";

export const update_style = (
  id: ItemId,
  callback: (style: CSSProperties) => CSSProperties
) => {
  updateGlobal((g) => {
    if (!(id in g.itemStore)) {
      console.error(`no item id:${id}`);
    }
    if (g.itemStore[id]!.custom === undefined) {
      g.itemStore[id]!.custom = {};
    }
    if (g.itemStore[id]!.custom!.style === undefined) {
      g.itemStore[id]!.custom!.style = {};
    }
    const style = g.itemStore[id]!.custom!.style!;
    g.itemStore[id]!.custom!.style = callback(style);
  });
  mark_local_changed();
};
