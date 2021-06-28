import React, { createRef, DragEventHandler, useEffect, useState } from "react";
import { CSSProperties } from "styled-components";
import { adjustFontSize, AdjustFontSize } from "./AdjustFontSize";
import "./App.css";

type Props = {
  text: string;
  id?: string;
};

const Fusen: React.FC<Props> = ({ children, text, id }) => {
  let [fontSize, setFontSize] = useState(1);
  const self = createRef<HTMLDivElement>();

  useEffect(() => {
    setFontSize(adjustFontSize(text));
  }, [text]);

  const style: CSSProperties = { fontSize };
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
      data-testid={text}
    >
      <div>{text}</div>
    </div>
  );
};

function App() {
  const [texts, setTexts] = useState([] as string[]);
  useEffect(() => {
    let a = 1;
    let b = 1;
    const texts = [];
    for (let i = 0; i < 11; i++) {
      [a, b] = [b, a + b];
      texts.push(">" + "あ".repeat(a));
    }
    setTexts(texts);
  }, []);
  return (
    <div className="App">
      <div id="canvas">
        {texts.map((text) => (
          <Fusen text={text} />
        ))}
      </div>
      <AdjustFontSize />
    </div>
  );
}

export default App;
