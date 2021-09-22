import { CSSProperties } from "react";
import { mark_local_changed } from "../utils/mark_local_changed";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { move_front } from "../utils/move_front";

export const update_style = (
  id: TItemId,
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
  move_front(id);
  mark_local_changed();
};
