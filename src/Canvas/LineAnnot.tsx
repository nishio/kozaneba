import { State } from "reactn/default";
import { get_item_bounding_box } from "../dimension/get_bounding_box";
import { mul_v2, normalize, rotate, sub_v2, V2 } from "../dimension/V2";
import { ItemId } from "../Global/initializeGlobalState";
import { TLineAnnot } from "../Global/TAnnotation";
import { get_gravity_point } from "../Menu/get_gravity_point";
import { bounding_box_to_rect } from "./bounding_box_to_rect";
import { get_box_line_crosspoint } from "./get_box_line_crosspoint";
import { get_global_position } from "./get_global_position";
import { Line } from "./Line";

export const LineAnnot = (g: State, a: TLineAnnot) => {
  const lines = [] as [V2, V2][];
  // currently ignore items[2~], and item deletion
  const positions = a.items.map((id) => get_global_position(id, g));
  const gp = get_gravity_point(positions);

  const get_rect = (id: ItemId) => {
    return bounding_box_to_rect(get_item_bounding_box(id));
  };
  const rects = a.items.map(get_rect);
  const crosspoints = a.items.map((id, index) =>
    get_box_line_crosspoint(positions[index]!, gp, rects[index]!)
  );
  if (a.items.length === 2) {
    lines.push([crosspoints[0]!, crosspoints[1]!]);
  } else {
    a.items.forEach((id, index) => {
      lines.push([gp, crosspoints[index]!]);
    });
  }

  a.heads.forEach((h, index) => {
    if (h === "arrow") {
      const p = crosspoints[index]!;
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
  const result = lines.map(([p1, p2]) => {
    return Line(p1, p2, onClick);
  });

  return result;
};
