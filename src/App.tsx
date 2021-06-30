import React, { useEffect } from "react";
import { useGlobal } from "reactn";
import { AdjustFontSize } from "./AdjustFontSize";
import "./App.css";
import { Center } from "./Center";
import { Fusen } from "./Fusen";
import { onWheel } from "./onWheel";

function App() {
  const [fusens] = useGlobal("fusens");
  console.log("render");
  useEffect(() => {
    console.log("useEffect");
    window.addEventListener("wheel", onWheel, { passive: false });
  }, []);

  return (
    <div className="App">
      <div id="canvas">
        <Center>
          {fusens.map((fusen) => (
            <Fusen value={fusen} />
          ))}
        </Center>
      </div>
      <AdjustFontSize />
    </div>
  );
}

export default App;
