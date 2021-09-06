import { useGlobal } from "reactn";
import { Center } from "./Center";
import { Kozane } from "../Kozane/Kozane";
import { kozaneToKozaneItem } from "../kozaneToKozaneItem";
import { ids_to_dom } from "./ids_to_dom";
import { onCanvasMouseDown } from "../Event/onCanvasMouseDown";
import { onCanvasMouseUp } from "../Event/onCanvasMouseUp";
import { onCanvasMouseMove } from "../Event/onCanvasMouseMove";
import { SelectionView } from "../Selection/Selection";
import { ItemId } from "../Global/initializeGlobalState";
import { useEffect, useRef } from "react";
import { onWheel } from "../Event/onWheel";
import { dev_log, dev_time, dev_time_end } from "../utils/dev";
import { add_v2, sub_v2, V2 } from "../dimension/V2";
import { TRect } from "../dimension/TRect";
import { add_kozane } from "../API/add_kozane";
import { get_item_bounding_box } from "../dimension/get_bounding_box";
import { TBoundingBox } from "../dimension/TBoundingBox";

export const ItemCanvas = () => {
  const [kozane] = useGlobal("kozane");
  const [drawOrder] = useGlobal("drawOrder");
  const [selected_items] = useGlobal("selected_items");
  const [is_selected] = useGlobal("is_selected");

  const ref = useRef<HTMLDivElement>(null);
  const offset = { x: 0, y: 0 };
  const not_selected_items = [] as ItemId[];
  let contents: JSX.Element;

  dev_log("render ItemCanvas");
  useEffect(() => {
    if (ref.current !== null) {
      ref.current.addEventListener("wheel", onWheel, { passive: false });
    }
  }, [ref]);

  if (is_selected) {
    const m = {} as { [key: string]: boolean };
    selected_items.forEach((id) => {
      m[id] = true;
    });
    drawOrder.forEach((id) => {
      if (m[id] !== true) {
        not_selected_items.push(id);
      }
    });
    contents = (
      <>
        <SelectionView></SelectionView>
        <Center opacity={0.5}>{ids_to_dom(not_selected_items, offset)}</Center>
      </>
    );
  } else {
    dev_time("ids_to_dom");
    const dom = ids_to_dom(drawOrder, offset);
    dev_time_end("ids_to_dom");

    contents = (
      <>
        <Center opacity={1}>
          {kozane.map((k) => (
            <Kozane value={kozaneToKozaneItem(k)} offset={offset} />
          ))}
          {dom}
          <SVGLayer />
        </Center>
        <SelectionView />
      </>
    );
  }
  return (
    <div
      id="canvas"
      onMouseUp={onCanvasMouseUp}
      onMouseDown={onCanvasMouseDown}
      onMouseMove={onCanvasMouseMove}
      data-testid="ba"
      ref={ref}
    >
      {contents}
    </div>
  );
};

const bounding_box_to_rect = (bb: TBoundingBox): TRect => {
  const { left, top, right, bottom } = bb;
  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
};
const SVGLayer = () => {
  const [g] = useGlobal();
  const v1 = g.itemStore["1"]!.position;
  const v2 = g.itemStore["2"]!.position;
  const WIDTH = 500;
  const HEIGHT = 500;
  const [x1, y1] = get_box_line_crosspoint(
    v1,
    v2,
    bounding_box_to_rect(get_item_bounding_box("1" as ItemId))
  );
  const [x2, y2] = get_box_line_crosspoint(
    v2,
    v1,
    bounding_box_to_rect(get_item_bounding_box("2" as ItemId))
  );
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
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="black"
        strokeWidth="10"
        strokeLinecap="round"
      />

      <text x="-100" y="-100" font-size="30" text-anchor="middle" fill="black">
        SVG
      </text>
      <text x="100" y="0" font-size="30" text-anchor="middle" fill="black">
        100,0
      </text>
      <text x="0" y="100" font-size="30" text-anchor="middle" fill="black">
        0,100
      </text>
    </svg>
  );
};

const get_box_line_crosspoint = (start: V2, end: V2, box: TRect) => {
  // box is around the start point
  const [dx, dy] = sub_v2(end, start);
  var grad = dy / dx;
  var igrad = dx / dy;

  const w = box.width / 2;
  const h = box.height / 2;
  let crosspoint: V2;
  if (w * Math.abs(dy) > h * Math.abs(dx)) {
    //intersection is on the top or bottom
    if (dy > 0) {
      // top
      crosspoint = [h * igrad, h];
    } else {
      // bottom
      crosspoint = [-h * igrad, -h];
    }
  } else {
    //intersection is on the left or right
    if (dx > 0) {
      // right
      crosspoint = [w, w * grad];
    } else {
      // left
      crosspoint = [-w, -grad * w];
    }
  }
  return add_v2(start, crosspoint);
};
