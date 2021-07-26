import { useGlobal } from "reactn";
import { Center } from "./Center";
import { Fusen } from "./Fusen";
import { fusenToFusenItem } from "./fusenToFusenItem";
import { idsToDom } from "./idsToDom";
import {
  onCanvasDrop,
  allowDrop,
  onCanvasMouseUp,
  onCanvasMouseDown,
  onCanvasMouseMove,
} from "./mouseEventMamager";
import { SelectionView } from "./Selection";
import { ItemId } from "./initializeGlobalState";

export const ItemCanvas = () => {
  const [fusens] = useGlobal("fusens");
  const [drawOrder] = useGlobal("drawOrder");
  const [selected_items] = useGlobal("selected_items");
  const [is_selected] = useGlobal("is_selected");
  const offset = { x: 0, y: 0 };
  const not_selected_items = [] as ItemId[];
  let contents: JSX.Element;
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
        <Center opacity={0.5}>{idsToDom(not_selected_items, offset)}</Center>
      </>
    );
  } else {
    contents = (
      <>
        <Center opacity={1}>
          {fusens.map((fusen) => (
            <Fusen value={fusenToFusenItem(fusen)} offset={offset} />
          ))}
          {idsToDom(drawOrder, offset)}
        </Center>
        <SelectionView />
      </>
    );
  }
  return (
    <div
      id="canvas"
      onDrop={onCanvasDrop}
      onDragOver={allowDrop}
      onMouseUp={onCanvasMouseUp}
      onMouseDown={onCanvasMouseDown}
      onMouseMove={onCanvasMouseMove}
    >
      {contents}
    </div>
  );
};
