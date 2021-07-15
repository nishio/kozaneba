import React, { useEffect } from "react";
import { useGlobal } from "reactn";
import { AddFusenDialog } from "./AddFusenDialog";
import { AdjustFontSize } from "./AdjustFontSize";
import "./App.css";
import { Center } from "./Center";
import { Fusen } from "./Fusen";
import { fusenToFusenItem } from "./fusenToFusenItem";
import { idsToDom } from "./idsToDom";
import { onWheel } from "./onWheel";

function App() {
  const [fusens] = useGlobal("fusens");
  const [drawOrder] = useGlobal("drawOrder");
  console.log("render");
  useEffect(() => {
    console.log("useEffect");
    window.addEventListener("wheel", onWheel, { passive: false });
  }, []);
  const offset = { x: 0, y: 0 };
  return (
    <div className="App">
      <div id="canvas">
        <Center>
          {fusens.map((fusen) => (
            <Fusen value={fusenToFusenItem(fusen)} offset={offset} />
          ))}
          {idsToDom(drawOrder, offset)}
        </Center>
      </div>
      <AdjustFontSize />
      <AddFusenDialog />
    </div>
  );
}

export default App;
