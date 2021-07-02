import React, { createRef, useEffect, useState } from "react";
import styled, { CSSProperties } from "styled-components";
import { adjustFontSize } from "./AdjustFontSize";
import { FusenItem } from "./initializeGlobalState";

export const getBoundingBox = (x: FusenItem) => {
  return {
    top: x.position[1] - 50,
    left: x.position[0] - 70,
    bottom: x.position[1] + 50,
    right: x.position[0] + 70,
  };
};

type Props = {
  value: FusenItem;
  id?: string;
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
  width: 140px;
`;
export const Fusen: React.FC<Props> = ({ children, value, id }) => {
  let [fontSize, setFontSize] = useState(1);
  const self = createRef<HTMLDivElement>();

  useEffect(() => {
    setFontSize(adjustFontSize(value.text));
  }, [value.text]);

  const x = value.position[0] ?? 0;
  const y = value.position[1] ?? 0;
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
    <FusenDiv className="fusen" ref={self} id={id} style={style}>
      <FusenDiv2>{value.text}</FusenDiv2>
    </FusenDiv>
  );
};
