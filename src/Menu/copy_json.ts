import { getGlobal } from "reactn";
import { get_item } from "../Event/get_item";
import { ItemId, TItem } from "../Global/initializeGlobalState";

type InType = "selection" | "all" | ItemId[];
const out = { console: true, clipboard: true };
type OutType = typeof out;

export const copy_json = (
  in_type: InType = "selection",
  out_type: OutType = out
): string => {
  const g = getGlobal();
  const drawOrder: ItemId[] = [];
  const itemStore: { [id: string]: TItem } = {};

  const _add_item = (id: ItemId) => {
    const item = get_item(g, id);
    itemStore[id] = item;
    if (item.type === "group") {
      item.items.forEach(_add_item);
    }
  };

  let target = in_type;
  if (target === "selection") {
    target = g.selected_items;
  } else if (target === "all") {
    target = g.drawOrder;
  }
  target.forEach((id) => {
    drawOrder.push(id);
    _add_item(id);
  });

  const json = JSON.stringify({
    drawOrder,
    itemStore,
    format: "Kozaneba",
    version: 3,
  });

  if (out_type.console) {
    console.log(json);
  }
  if (out_type.clipboard) {
    navigator.clipboard.writeText(json);
  }
  return json;
};
