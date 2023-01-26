import { getGlobal } from "reactn";
import { kozaneba } from "../API/KozanebaAPI";
import { get_middle_point } from "../Canvas/Annotation/get_middle_point";
import { TArrowHead } from "../Global/TAnnotation";
import { TItemId } from "../Global/TItemId";
import { get_item } from "./get_item";

export type THeadsOption = "all" | "none" | "right";

export const add_arrow_among_selected_items = (
  targets: TItemId[],
  heads_option: TArrowHead[] | THeadsOption,
  is_doubled = false
) => {
  if (targets.length < 2) return;
  const g = getGlobal();
  const positions = targets.map((id) => get_item(g, id).position);

  let heads: TArrowHead[];
  if (heads_option === "all") {
    heads = targets.map(() => "arrow");
  } else if (heads_option === "none") {
    heads = targets.map(() => "none");
  } else if (heads_option === "right") {
    const middle = get_middle_point(positions);
    heads = positions.map((v) => {
      if (v[0] > middle[0]) {
        return "arrow";
      }
      return "none";
    });
  } else {
    heads = heads_option;
  }
  kozaneba.add_arrow(g.selected_items, heads, is_doubled);
};
