import { CSSProperties } from "react";
import { mark_local_changed } from "../Cloud/mark_local_changed";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";

export const update_style = (
  id: ItemId,
  callback: (style: CSSProperties) => void | CSSProperties
) => {
  updateGlobal((g) => {
    const style = g.itemStore[id]?.custom?.style ?? {};
    return callback(style);
  });
  mark_local_changed();
};
