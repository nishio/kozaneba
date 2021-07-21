import { useEffect } from "react";
import { useGlobal } from "reactn";
import { AddFusenDialog } from "./AddFusenDialog";
import { AdjustFontSize } from "./AdjustFontSize";
import "./App.css";
import { Center } from "./Center";
import { Fusen } from "./Fusen";
import { fusenToFusenItem } from "./fusenToFusenItem";
import { idsToDom } from "./idsToDom";
import { onWheel } from "./onWheel";
import { MenuAnchor } from "./show_menu";
import { FusenMenu } from "./FusenMenu";
import {
  onDrop,
  allowDrop,
  onMouseUp,
  onMouseDown,
  onMouseMove,
} from "./mouseEventMamager";
import { Selection } from "./Selection";
import { ItemId } from "./initializeGlobalState";
import { MyAppBar } from "./MyAppBar";

function App() {
  const [fusens] = useGlobal("fusens");
  const [drawOrder] = useGlobal("drawOrder");
  const [selected_items] = useGlobal("selected_items");
  // console.log("render");
  useEffect(() => {
    // console.log("useEffect");
    window.addEventListener("wheel", onWheel, { passive: false });
  }, []);

  const offset = { x: 0, y: 0 };

  const not_selected_items = [] as ItemId[];
  const is_selected = selected_items.length > 0;
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
  }
  return (
    <div className="App">
      <MyAppBar />
      <div
        id="canvas"
        onDrop={onDrop}
        onDragOver={allowDrop}
        onMouseUp={onMouseUp}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
      >
        {is_selected ? (
          <>
            <Center opacity={1}>{idsToDom(selected_items, offset)}</Center>
            <Center opacity={0.5}>
              {idsToDom(not_selected_items, offset)}
            </Center>
          </>
        ) : (
          <Center opacity={1}>
            {fusens.map((fusen) => (
              <Fusen value={fusenToFusenItem(fusen)} offset={offset} />
            ))}
            {idsToDom(drawOrder, offset)}
          </Center>
        )}

        <Selection />
      </div>
      <AdjustFontSize />
      <AddFusenDialog />
      <FusenMenu />
      <MenuAnchor />
    </div>
  );
}

export default App;
