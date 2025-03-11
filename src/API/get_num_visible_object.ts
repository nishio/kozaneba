import { getGlobal } from "../Global/ReactnCompat";
import { TItemId } from "../Global/TItemId";

export const get_num_visible_object = () => {
  const g = getGlobal();
  let count: { [key: string]: number } = { total: 0 };
  const visit = (id: TItemId) => {
    count.total++;
    const item = g.itemStore[id]!;
    count[item.type] = (count[item.type] ?? 0) + 1;
    if (item.type === "group") {
      if (item.isOpen) {
        item.items.forEach(visit);
      }
    }
  };
  g.drawOrder.forEach(visit);
  count["annotations"] = g.annotations.length;
  return count;
};
