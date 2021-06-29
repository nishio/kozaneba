import React, { createRef, DragEventHandler, useEffect, useState } from "react";
import { CSSProperties } from "styled-components";
import { adjustFontSize } from "./AdjustFontSize";
import { VFusen } from "./VFusen";

type Props = {
  value: VFusen;
  id?: string;
};
export const Fusen: React.FC<Props> = ({ children, value, id }) => {
  let [fontSize, setFontSize] = useState(1);
  const self = createRef<HTMLDivElement>();

  useEffect(() => {
    setFontSize(adjustFontSize(value.text));
  }, [value.text]);

  const x = value.x ?? 0;
  const y = value.y ?? 0;
  const scale = 1;
  const style: CSSProperties = {
    fontSize,
    left: x - (scale * 140) / 2 + "px",
    top: y - (scale * 100) / 2 + "px",
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
