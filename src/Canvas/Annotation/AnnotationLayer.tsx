import type { ReactNode } from "react";
import { getGlobal, useGlobal } from "reactn";
import { get_items_bounding_box } from "../../dimension/get_group_bounding_box";
import { TAnnotation } from "../../Global/TAnnotation";
import { bounding_box_to_rect } from "../../dimension/bounding_box_to_rect";
import { LineAnnot, TLineAnnotElements } from "./LineAnnot";

const get_contents_bound = () => {
  const g = getGlobal();
  return get_items_bounding_box(g.drawOrder);
};

// Draws the lines in two SVG layers around `children` (the items): the
// transparent hit lines below the items and the visible lines above them.
// A press on a kozane / group that a line overlaps goes to the item, so lines
// do not get in the way of moving kozane.
export const AnnotationLayer = ({ children }: { children?: ReactNode }) => {
  const [g] = useGlobal();

  const elements = g.annotations.flatMap((a: TAnnotation, index) => {
    if (a.type === "line") {
      const e = LineAnnot(g, a, index);
      return e === null ? [] : [e];
    }
    return [];
  }) as TLineAnnotElements[];
  const b = get_contents_bound();
  const r = bounding_box_to_rect(b);
  const layer = (content: ReactNode, testid: string) => (
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
      data-testid={testid}
    >
      {content}
    </svg>
  );
  return (
    <>
      {layer(
        elements.map((e) => e.hit),
        "annotation-hit-layer"
      )}
      {children}
      {layer(
        elements.map((e) => e.visual),
        "annotation-layer"
      )}
    </>
  );
};
