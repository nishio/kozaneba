import { getGlobal } from "reactn";
import { get_item } from "./get_item";
import { get_gravity_point } from "../dimension/get_gravity_point";
import { TArrowHead } from "../Global/TAnnotation";
import { updateGlobal } from "../Global/updateGlobal";
import { ItemId } from "../Global/ItemId";

export const add_arrow = (targets: ItemId[]) => {
  if (targets.length < 2) return;
  const g = getGlobal();
  const positions = targets.map((id) => get_item(g, id).position);
  const gp = get_gravity_point(positions);
  const heads: TArrowHead[] = positions.map((v) => {
    if (v[0] + v[1] > gp[0] + gp[1]) {
      return "arrow";
    }
    return "none";
  });
  updateGlobal((g) => {
    g.annotations.push({
      type: "line",
      items: g.selected_items,
      heads,
      custom: {
        stroke_width: 10,
        arrow_head_size: 30,
        opacity: 1,
        is_clickable: true,
      },
    });
  });
};
