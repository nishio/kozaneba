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
import { SelectionView } from "./Selection";
import { ItemId } from "./initializeGlobalState";
import { MyAppBar } from "./MyAppBar";

const Blank = () => {
  const [fusens] = useGlobal("fusens");
  const [drawOrder] = useGlobal("drawOrder");
  const [selected_items] = useGlobal("selected_items");
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
            <SelectionView></SelectionView>
            <Center opacity={0.5}>
              {idsToDom(not_selected_items, offset)}
            </Center>
          </>
        ) : (
          <>
            <Center opacity={1}>
              {fusens.map((fusen) => (
                <Fusen value={fusenToFusenItem(fusen)} offset={offset} />
              ))}
              {idsToDom(drawOrder, offset)}
            </Center>
            <SelectionView />
          </>
        )}
      </div>
      <AdjustFontSize />
      <AddFusenDialog />
      <FusenMenu />
      <MenuAnchor />
    </div>
  );
}

function App() {
  useEffect(() => {
    window.addEventListener("wheel", onWheel, { passive: false });
  }, []);


  const hash = window.location.hash;
  if (hash === "#blank") {
    return <Blank/>
  }
  if (hash === "") {
    return <></>  // tutorial for first visiter
  }
  // TODO: parse hash
  return <></>
}

export default App;
