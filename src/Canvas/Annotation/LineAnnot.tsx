import { State } from "reactn/default";
import { get_item_bounding_box } from "../../dimension/get_bounding_box";
import {
  equal_v2,
  mul_v2,
  normalize,
  rotate,
  sub_v2,
  V2,
} from "../../dimension/V2";
import { ItemId } from "../../Global/ItemId";
import { TLineAnnot } from "../../Global/TAnnotation";
import { get_gravity_point } from "../../dimension/get_gravity_point";
import { bounding_box_to_rect } from "../../dimension/bounding_box_to_rect";
import { get_box_line_crosspoint } from "./get_box_line_crosspoint";
import { get_global_position } from "../../dimension/get_global_position";
import { Line } from "./Line";

export const LineAnnot = (g: State, a: TLineAnnot, annot_index: number) => {
  const lines = [] as [V2, V2][];
  // currently ignore items[2~], and item deletion
  const positions = a.items.map((id) => get_global_position(id, g));
  const gp = get_gravity_point(positions);
  if (a.items.length === 2) {
    if (equal_v2(positions[0]!, positions[1]!)) {
      // same point. e.g. in the same closed group
      return [];
    }
  }

  const get_rect = (id: ItemId) => {
    return bounding_box_to_rect(get_item_bounding_box(id));
  };
  const rects = a.items.map(get_rect);
  const crosspoints = a.items.map((id, index) =>
    get_box_line_crosspoint(positions[index]!, gp, rects[index]!)
  );
  if (a.items.length === 2) {
    if (!equal_v2(crosspoints[0]!, crosspoints[1]!)) {
      lines.push([crosspoints[0]!, crosspoints[1]!]);
    } else {
      return [];
    }
  } else {
    crosspoints.forEach((cp) => {
      if (!equal_v2(gp, cp)) {
        lines.push([gp, cp]);
      }
    });
  }

  a.heads.forEach((h, index) => {
    if (h === "arrow") {
      const p = crosspoints[index]!;
      if (equal_v2(gp, p)) return;
      // arrow head
      const n = normalize(sub_v2(p, gp));
      const size = 30;
      const h1 = sub_v2(p, mul_v2(size, rotate(n, 30)));
      const h2 = sub_v2(p, mul_v2(size, rotate(n, -30)));

      lines.push([h1, p]);
      lines.push([h2, p]);
    }
  });
  const onClick = () => {
    console.log("line clicked");
  };
  const result = lines.map(([p1, p2], index) => {
    return Line(p1, p2, onClick, `line-${annot_index}-${index}`);
  });

  return result;
};
