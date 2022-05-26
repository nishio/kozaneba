import { State } from "reactn/default";
import { bounding_box_to_rect } from "../../dimension/bounding_box_to_rect";
import { get_item_bounding_box } from "../../dimension/get_bounding_box";
import { get_global_position } from "../../dimension/get_global_position";
import {
  add_v2,
  equal_v2,
  L2norm,
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

const arrow_angle = 30; // degrees
const arrow_tan = Math.tan((arrow_angle / 180) * Math.PI);
const arrow_sin = Math.sin((arrow_angle / 180) * Math.PI);

export const LineAnnot = (g: State, a: TLineAnnot, annot_index: number) => {
  const lines = [] as [V2, V2, number][];
  // currently ignore items[2~], and item deletion
  const positions = a.items.map((id) => get_global_position(id, g));
  const center = get_middle_point(positions);

  const is_doubled = a.is_doubled;
  const stroke_width = a.custom?.stroke_width ?? 1;

  const arrow_head_size =
    (a.custom?.arrow_head_size ?? 10) +
    (is_doubled ? stroke_width / arrow_sin : 0);

  let group_opacity = 1.0;
  const opacity_from_length = (length: number): number => {
    const threshold = 130;
    if (length < threshold) {
      return 1;
    } else if (length < threshold * 3) {
      // from 1.0 to 0.1
      return 1 + (-0.9 * (length - threshold)) / (2 * threshold);
    }
    return 0.1;
  };

  const draw_arrowhead = (
    h: "none" | "arrow" | undefined,
    index: number
  ): void => {
    if (h === "arrow") {
      const p = crosspoints[index];
      if (p === undefined || equal_v2(center, p)) return;
      // arrow head
      const n = normalize(sub_v2(p, center));
      const h1 = sub_v2(p, mul_v2(arrow_head_size, rotate(n, arrow_angle)));
      const h2 = sub_v2(p, mul_v2(arrow_head_size, rotate(n, -arrow_angle)));

      lines.push([h1, p, 1]);
      lines.push([h2, p, 1]);
    }
  };

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
  const crosspoints = a.items.map((id, index) => {
    const p = positions[index]!;
    if (!equal_v2(p, center)) {
      return get_box_line_crosspoint(p, center, rects[index]!);
    } else {
      return undefined;
    }
  });

  if (a.items.length === 2) {
    const cp0 = crosspoints[0];
    const cp1 = crosspoints[1];
    if (cp0 === undefined || cp1 === undefined || equal_v2(cp0, cp1)) {
      return [];
    }
    const v = sub_v2(cp1, cp0);
    const length = L2norm(v);
    const opacity = 1;
    group_opacity = Math.min(opacity_from_length(length), group_opacity);
    if (!is_doubled) {
      lines.push([cp0, cp1, opacity]);
    } else {
      // doubled line, if has head, shorten the line

      const n = normalize(sub_v2(cp0, cp1));
      const d = mul_v2(10, rotate(n, 90));
      const shorten = mul_v2(20, n);
      const p0 = a.heads[0] === "arrow" ? sub_v2(cp0, shorten) : cp0;
      const p1 = a.heads[1] === "arrow" ? add_v2(cp1, shorten) : cp1;
      lines.push([add_v2(p1, d), add_v2(p0, d), opacity]);
      lines.push([sub_v2(p1, d), sub_v2(p0, d), opacity]);
    }
    draw_arrowhead(a.heads[0], 0);
    draw_arrowhead(a.heads[1], 1);
    // end of (a.items.length === 2)
  } else {
    // a.items.length !== 2
    const angles = crosspoints.flatMap((cp) => {
      if (cp === undefined) return [];
      const d = sub_v2(center, cp);
      const th = Math.atan2(d[1], d[0]);
      return [th];
    });
    angles.sort((a, b) => a - b);

    crosspoints.forEach((cp, index) => {
      if (cp !== undefined && !equal_v2(center, cp)) {
        draw_arrowhead(a.heads[index], index);
        if (!is_doubled) {
          lines.push([center, cp, 1]);
          const d = sub_v2(center, cp);
          const length = L2norm(d);
          group_opacity = Math.min(opacity_from_length(length), group_opacity);
        } else {
          // double lines
          const d = sub_v2(center, cp);
          const length = L2norm(d);
          group_opacity = Math.min(opacity_from_length(length), group_opacity);

          const n = normalize(d);
          const side = mul_v2(stroke_width, rotate(n, 90));
          const shorten = mul_v2(stroke_width / arrow_tan, n);
          const p0 = a.heads[index] === "arrow" ? add_v2(cp, shorten) : cp;

          const angle = Math.atan2(d[1], d[0]);
          const N = angles.length;
          const i = angles.indexOf(angle);

          const next_angle = angles[(i + 1) % N]!;
          const prev_angle = angles[(i - 1 + N) % N]!;
          const max_shorten = L2norm(d);
          const angle_to_shorten = (th: number) => {
            return Math.min(
              max_shorten,
              stroke_width * (1 / Math.sin(th) + 1 / Math.tan(th))
            );
          };

          const shorten_next = angle_to_shorten(next_angle - angle);
          const shorten_prev = angle_to_shorten(angle - prev_angle);

          const p1n = sub_v2(center, mul_v2(shorten_next, n));
          const p1p = sub_v2(center, mul_v2(shorten_prev, n));
          lines.push([add_v2(p1p, side), add_v2(p0, side), 1]);
          lines.push([sub_v2(p1n, side), sub_v2(p0, side), 1]);
        }
      }
    });
  }

  // const is_clickable = a.custom?.is_clickable ?? false;
  const is_clickable = false;
  let onClick: (() => void) | undefined = undefined;
  if (is_clickable) {
    onClick = () => {
      console.log("line clicked");
    };
  }

  const custom_opacity = a.custom?.opacity ?? 0.2;

  const result = lines.map(([p1, p2, op], index) => {
    return Line(
      p1,
      p2,
      onClick,
      `line-${annot_index}-${index}`,
      stroke_width,
      1, // was: opacity * op,
      is_clickable
    );
  });

  // return result;
  return <g opacity={custom_opacity * group_opacity}>{result}</g>;
};
