import { getGlobal } from "reactn";
import { kozaneba } from "../API/KozanebaAPI";
import { get_gravity_point } from "../dimension/get_gravity_point";
import { ItemId } from "../Global/ItemId";
import { TArrowHead } from "../Global/TAnnotation";
import { get_item } from "./get_item";

export const add_arrow = (targets: ItemId[]) => {
  if (targets.length < 2) return;
  const g = getGlobal();
  const positions = targets.map((id) => get_item(g, id).position);
  const gp = get_gravity_point(positions);
  const heads: TArrowHead[] = positions.map((v) => {
    if (v[0] > gp[0]) {
      return "arrow";
    }
    return "none";
  });
  kozaneba.add_arrow(g.selected_items, heads);
};
