import React, { createRef, useEffect, useState } from "react";
import styled, { CSSProperties } from "styled-components";
import { adjustFontSize } from "./AdjustFontSize";
import { FusenItem, ItemId } from "./initializeGlobalState";
import { TOffset } from "./TOffset";

const FUSEN_WIDTH = 130;
const FUSEN_HEIGHT = 100;
const BORDER = 1;
export const getBoundingBox = (item: FusenItem) => {
  const [x, y] = item.position;
  const scale = item.scale;
  const b = {
    top: y - (FUSEN_HEIGHT / 2) * scale,
    left: x - (FUSEN_WIDTH / 2) * scale,
    bottom: y + (FUSEN_HEIGHT / 2) * scale,
    right: x + (FUSEN_WIDTH / 2) * scale,
  };
  console.log(item.text, item.scale, b);
  return b;
};
type Props = {
  value: { position: number[]; scale: number; text: string; id: ItemId };
  offset: TOffset;
  custom_style?: CSSProperties;
};

export const FusenDiv = styled.div`
  background: #ffc;
  opacity: 0.8;
  width: ${FUSEN_WIDTH}px;
  height: ${FUSEN_HEIGHT}px;
  color: #000;
  word-wrap: break-word;
  overflow: hidden;
  font-size: 100px;
  text-align: center;
  display: flex;
  align-items: center;
  align-content: center;
  border: #aaa ${BORDER}px solid;
  position: absolute;
  line-height: 0.9;
`;

export const FusenDiv2 = styled.div`
  width: 100%;
`;

export const Fusen: React.FC<Props> = ({
  value,
  offset,
  custom_style = {},
}) => {
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
    left: offset.x + x - (scale * FUSEN_WIDTH) / 2 + "px",
    top: offset.y + y - (scale * FUSEN_HEIGHT) / 2 + "px",
    width: FUSEN_WIDTH * scale + "px",
    height: FUSEN_HEIGHT * scale + "px",
    ...custom_style,
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
