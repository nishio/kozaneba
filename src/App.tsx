import React, { createRef, DragEventHandler, useEffect, useState } from "react";
import { useGlobal } from "reactn";
import { CSSProperties } from "styled-components";
import { adjustFontSize, AdjustFontSize } from "./AdjustFontSize";
import "./App.css";
import { VFusen } from "./VFusen";

type Props = {
  value: VFusen;
  id?: string;
};

const Fusen: React.FC<Props> = ({ children, value, id }) => {
  let [fontSize, setFontSize] = useState(1);
  const self = createRef<HTMLDivElement>();

  useEffect(() => {
    setFontSize(adjustFontSize(value.text));
  }, [value.text]);

  const x = value.x ?? 0;
  const y = value.y ?? 0;

  const style: CSSProperties = {
    fontSize,
    left: x + "px",
    top: y + "px",
  };
  const tooLong = fontSize === 0;
  if (tooLong) {
    style.fontSize = 1;
    style.alignItems = "flex-start";
  }

  const onDragEnd: DragEventHandler<HTMLDivElement> = (e) => {
    console.log(e);
    if (self.current !== null) {
      self.current.style.position = "absolute";
      self.current.style.left = e.clientX + "px";
      self.current.style.top = e.clientY + "px";
      e.preventDefault();
    }
  };

  return (
    <div
      className="fusen"
      ref={self}
      draggable={true}
      id={id}
      style={style}
      onDragEnd={onDragEnd}
    >
      <div>{value.text}</div>
    </div>
  );
};

function App() {
  const [fusens] = useGlobal("fusens");
  console.log("render");
  useEffect(() => {
    console.log("useEffect");
  }, []);

  return (
    <div className="App">
      <div id="canvas">
        {fusens.map((fusen) => (
          <Fusen value={fusen} />
        ))}
      </div>
      <AdjustFontSize />
    </div>
  );
}

export default App;
