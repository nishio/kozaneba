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

export const ItemCanvas = () => {
  const [kozane] = useGlobal("kozane");
  const [drawOrder] = useGlobal("drawOrder");
  useGlobal("itemStore");
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
