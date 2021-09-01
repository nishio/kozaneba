import { getGlobal } from "reactn";
import { get_item } from "../Event/get_item";
import { ItemId, TItem } from "../Global/initializeGlobalState";

export const copy_json = () => {
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
  g.selected_items.forEach((id) => {
    drawOrder.push(id);
    _add_item(id);
  });
  const json = JSON.stringify({
    drawOrder,
    itemStore,
    format: "Kozaneba",
    version: 3,
  });
  console.log(json);
  navigator.clipboard.writeText(json);
};
