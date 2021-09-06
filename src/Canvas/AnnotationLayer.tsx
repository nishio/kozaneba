import { useGlobal } from "reactn";
import { get_item_bounding_box } from "../dimension/get_bounding_box";
import { mul_v2, normalize, rotate, sub_v2, V2 } from "../dimension/V2";
import { ItemId } from "../Global/initializeGlobalState";
import { TAnnotation } from "../Global/TAnnotation";
import { get_gravity_point } from "../Menu/get_gravity_point";
import { bounding_box_to_rect } from "./bounding_box_to_rect";
import { get_box_line_crosspoint } from "./get_box_line_crosspoint";

export const AnnotationLayer = () => {
  const [g] = useGlobal();
  const WIDTH = 500;
  const HEIGHT = 500;

  const annotElement = g.annotations.flatMap((a: TAnnotation) => {
    const result = [];
    // currently ignore items[2~], and item deletion
    const positions = a.items.map((i) => g.itemStore[i]!.position);
    const gp = get_gravity_point(positions);

    const get_rect = (id: ItemId) => {
      return bounding_box_to_rect(get_item_bounding_box(id));
    };
    const rects = a.items.map(get_rect);
    const crosspoints = a.items.map((id, index) =>
      get_box_line_crosspoint(positions[index]!, gp, rects[index]!)
    );
    const [x1, y1] = crosspoints[0]!;
    const [x2, y2] = crosspoints[1]!;

    result.push(
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
    a.heads.forEach((h, index) => {
      if (h === "arrow") {
        const p = crosspoints[index]!;
        // arrow head
        const n = normalize(sub_v2(p, gp));
        const size = 30;
        const [h1x, h1y] = sub_v2(p, mul_v2(size, rotate(n, 30)));
        const [h2x, h2y] = sub_v2(p, mul_v2(size, rotate(n, -30)));

        result.push(
          <line
            x1={h1x}
            y1={h1y}
            x2={x2}
            y2={y2}
            stroke="black"
            strokeWidth="10"
            strokeLinecap="round"
          />
        );
        result.push(
          <line
            x1={h2x}
            y1={h2y}
            x2={x2}
            y2={y2}
            stroke="black"
            strokeWidth="10"
            strokeLinecap="round"
          />
        );
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
