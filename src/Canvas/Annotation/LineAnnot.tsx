import { State } from "reactn/default";
import { bounding_box_to_rect } from "../../dimension/bounding_box_to_rect";
import { get_item_bounding_box } from "../../dimension/get_bounding_box";
import { get_global_position } from "../../dimension/get_global_position";
import {
  equal_v2,
  mul_v2,
  normalize,
  rotate,
  sub_v2,
  V2,
} from "../../dimension/V2";
import { TLineAnnot } from "../../Global/TAnnotation";
import { TItemId } from "../../Global/TItemId";
import { get_box_line_crosspoint } from "./get_box_line_crosspoint";
import { get_middle_point } from "./get_middle_point";
import { Line } from "./Line";

export const LineAnnot = (g: State, a: TLineAnnot, annot_index: number) => {
  const lines = [] as [V2, V2][];
  // currently ignore items[2~], and item deletion
  const positions = a.items.map((id) => get_global_position(id, g));
  const center = get_middle_point(positions);

  if (a.items.length === 2) {
    if (equal_v2(positions[0]!, positions[1]!)) {
      // same point. e.g. in the same closed group
      return [];
    }
  }

  const get_rect = (id: TItemId) => {
    return bounding_box_to_rect(get_item_bounding_box(id));
  };
  const rects = a.items.map(get_rect);
  const crosspoints = a.items.map((id, index) =>
    get_box_line_crosspoint(positions[index]!, center, rects[index]!)
  );
  if (a.items.length === 2) {
    if (!equal_v2(crosspoints[0]!, crosspoints[1]!)) {
      lines.push([crosspoints[0]!, crosspoints[1]!]);
    } else {
      return [];
    }
  } else {
    crosspoints.forEach((cp) => {
      if (!equal_v2(center, cp)) {
        lines.push([center, cp]);
      }
    });
  }

  const arrow_head_size = a.custom?.arrow_head_size ?? 10;
  a.heads.forEach((h, index) => {
    if (h === "arrow") {
      const p = crosspoints[index]!;
      if (equal_v2(center, p)) return;
      // arrow head
      const n = normalize(sub_v2(p, center));
      const h1 = sub_v2(p, mul_v2(arrow_head_size, rotate(n, 30)));
      const h2 = sub_v2(p, mul_v2(arrow_head_size, rotate(n, -30)));

      lines.push([h1, p]);
      lines.push([h2, p]);
    }
  });
  const is_clickable = a.custom?.is_clickable ?? false;
  let onClick: (() => void) | undefined = undefined;
  if (is_clickable) {
    onClick = () => {
      console.log("line clicked");
    };
  }

  const stroke_width = a.custom?.stroke_width ?? 1;
  const opacity = a.custom?.opacity ?? 0.2;

  const result = lines.map(([p1, p2], index) => {
    return Line(
      p1,
      p2,
      onClick,
      `line-${annot_index}-${index}`,
      stroke_width,
      opacity,
      is_clickable
    );
  });

  return result;
};
