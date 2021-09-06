import { useGlobal } from "reactn";
import { get_item_bounding_box } from "../dimension/get_bounding_box";
import { mul_v2, normalize, rotate, sub_v2, V2 } from "../dimension/V2";
import { get_item } from "../Event/get_item";
import { ItemId } from "../Global/initializeGlobalState";
import { TAnnotation } from "../Global/TAnnotation";
import { get_gravity_point } from "../Menu/get_gravity_point";
import { bounding_box_to_rect } from "./bounding_box_to_rect";
import { get_box_line_crosspoint } from "./get_box_line_crosspoint";

export const Line = (p1: V2, p2: V2) => {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="black"
      strokeWidth="10"
      strokeLinecap="round"
    />
  );
};

export const AnnotationLayer = () => {
  const [g] = useGlobal();
  const WIDTH = document.body.clientWidth;
  const HEIGHT = document.body.clientHeight;

  const annotElement = g.annotations.flatMap((a: TAnnotation) => {
    const result = [];
    // currently ignore items[2~], and item deletion
    const positions = a.items.map((id) => get_item(g, id).position);
    const gp = get_gravity_point(positions);

    const get_rect = (id: ItemId) => {
      return bounding_box_to_rect(get_item_bounding_box(id));
    };
    const rects = a.items.map(get_rect);
    const crosspoints = a.items.map((id, index) =>
      get_box_line_crosspoint(positions[index]!, gp, rects[index]!)
    );
    if (a.items.length === 2) {
      result.push(Line(crosspoints[0]!, crosspoints[1]!));
    } else {
      a.items.forEach((id, index) => {
        result.push(Line(gp, crosspoints[index]!));
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

        result.push(Line(h1, p));
        result.push(Line(h2, p));
      }
    });
    return result;
  });

  return (
    <svg
      version="1.1"
      width={WIDTH}
      height={HEIGHT}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        top: -HEIGHT / 2 + "px",
        left: -WIDTH / 2 + "px",
        pointerEvents: "none", // paththrogh event on background
      }}
      viewBox={`-${WIDTH / 2} -${HEIGHT / 2} ${WIDTH} ${HEIGHT}`}
    >
      {annotElement}
    </svg>
  );
};
