import React, { useEffect } from "react";
import { useGlobal } from "reactn";
import styled from "styled-components";
import { AdjustFontSize } from "./AdjustFontSize";
import "./App.css";
import { Fusen } from "./Fusen";

const Center = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0px;
  height: 0px;
  background-color: blue;
  overflow: visible;
  transform: scale(1) translate(0px, 0px);
`;

function App() {
  const [fusens] = useGlobal("fusens");
  console.log("render");
  useEffect(() => {
    console.log("useEffect");
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
