import React, { createRef, useEffect, useState } from "react";
import styled, { CSSProperties } from "styled-components";
import { adjustFontSize } from "./AdjustFontSize";
import { FusenItem } from "./initializeGlobalState";
import { TOffset } from "./TOffset";

export const getBoundingBox = (item: FusenItem) => {
  const [x, y] = item.position;
  const scale = item.scale;
  return {
    top: y - 50 * scale,
    left: x - 70 * scale,
    bottom: y + 50 * scale,
    right: x + 70 * scale,
  };
};
type Props = {
  value: FusenItem;
  offset: TOffset;
};

export const FusenDiv = styled.div`
  background: #ffc;
  opacity: 0.8;
  width: 140px;
  height: 100px;
  color: #000;
  word-wrap: break-word;
  overflow: hidden;
  font-size: 100px;
  text-align: center;
  display: flex;
  align-items: center;
  align-content: center;
  border: #aaa 1px solid;
  position: absolute;
`;

export const FusenDiv2 = styled.div`
  width: 100%;
`;
export const Fusen: React.FC<Props> = ({ value, offset }) => {
  let [fontSize, setFontSize] = useState(1);
  const self = createRef<HTMLDivElement>();
  const x = value.position[0] ?? 0;
  const y = value.position[1] ?? 0;
  const scale = value.scale;

  useEffect(() => {
    setFontSize(adjustFontSize(value.text) * scale);
  }, [value.text, scale]);

  const style: CSSProperties = {
    fontSize,
    left: offset.x + x - (scale * 140) / 2 + "px",
    top: offset.y + y - (scale * 100) / 2 + "px",
    width: 140 * scale + "px",
    height: 100 * scale + "px",
  };
  const tooLong = fontSize === 0;
  if (tooLong) {
    style.fontSize = 1;
    style.alignItems = "flex-start";
  }

  // const onDragEnd: DragEventHandler<HTMLDivElement> = (e) => {
  //   console.log(e);
  //   if (self.current !== null) {
  //     self.current.style.position = "absolute";
  //     self.current.style.left = e.clientX + "px";
  //     self.current.style.top = e.clientY + "px";
  //     e.preventDefault();
  //   }
  // };

  return (
    <FusenDiv
      className="fusen"
      ref={self}
      data-testid={value.id}
      key={value.id}
      style={style}
    >
      <FusenDiv2>{value.text}</FusenDiv2>
    </FusenDiv>
  );
};
