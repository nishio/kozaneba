import React, { useEffect } from "react";
import { useGlobal } from "reactn";
import { AdjustFontSize } from "./AdjustFontSize";
import "./App.css";
import { Fusen } from "./Fusen";

function App() {
  const [fusens] = useGlobal("fusens");
  console.log("render");
  useEffect(() => {
    console.log("useEffect");
  }, []);

  return (
    <div className="App">
      <div id="canvas">
        <div id="center">
          {fusens.map((fusen) => (
            <Fusen value={fusen} />
          ))}
        </div>
      </div>
      <AdjustFontSize />
    </div>
  );
}

export default App;
