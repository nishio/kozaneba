import { getGlobal } from "reactn";
import { get_item } from "../utils/get_item";
import { TItemId } from "../Global/TItemId";
import { TItem } from "../Global/TItem";
import { TAnnotation, TArrowHead } from "../Global/TAnnotation";

type InType = "selection" | "all" | TItemId[];
const out = { console: true, clipboard: true };
type OutType = typeof out;

export const copy_json = (
  in_type: InType = "selection",
  out_type: OutType = out
): string => {
  const g = getGlobal();
  const drawOrder: TItemId[] = [];
  const itemStore: { [id: string]: TItem } = {};

  const items_to_copy: TItemId[] = [];

  const add_item_recursively = (id: TItemId) => {
    const item = get_item(g, id);
    items_to_copy.push(id);
    itemStore[id] = item;
    if (item.type === "group") {
      item.items.forEach(add_item_recursively);
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
    add_item_recursively(id);
  });

  const annotation: TAnnotation[] = [];
  g.annotations.forEach((a) => {
    if (a.type === "line") {
      const new_heads: TArrowHead[] = [];
      const new_items: TItemId[] = [];
      a.items.forEach((id, index) => {
        if (items_to_copy.includes(id)) {
          new_items.push(id);
          new_heads.push(a.heads[index]!);
        }
      });
      if (new_items.length < 2) {
        // ignore this
      } else {
        annotation.push({ ...a, items: new_items, heads: new_heads });
      }
    }
  });

  const json = JSON.stringify({
    drawOrder,
    itemStore,
    annotation,
    format: "Kozaneba",
    version: 4,
  });

  if (out_type.console) {
    console.log(json);
  }
  if (out_type.clipboard) {
    navigator.clipboard.writeText(json);
  }
  return json;
};
