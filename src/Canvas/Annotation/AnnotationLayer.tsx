import { getGlobal, useGlobal } from "../../Global/ReactnCompat";
import { get_items_bounding_box } from "../../dimension/get_group_bounding_box";
import { TAnnotation } from "../../Global/TAnnotation";
import { bounding_box_to_rect } from "../../dimension/bounding_box_to_rect";
import { LineAnnot } from "./LineAnnot";

const get_contents_bound = () => {
  const g = getGlobal();
  return get_items_bounding_box(g.drawOrder);
};

export const AnnotationLayer = () => {
  const [g] = useGlobal();

  const annotElement = g.annotations.flatMap((a: TAnnotation, index) => {
    if (a.type === "line") {
      return LineAnnot(g, a, index);
    }
    return [];
  });
  const b = get_contents_bound();
  const r = bounding_box_to_rect(b);
  return (
    <svg
      version="1.1"
      width={r.width}
      height={r.height}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        top: r.top + "px",
        left: r.left + "px",
        pointerEvents: "none", // paththrogh event on background
      }}
      viewBox={`${r.left} ${r.top} ${r.width} ${r.height}`}
    >
      {annotElement}
    </svg>
  );
};
