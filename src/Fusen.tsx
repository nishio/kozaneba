import React, { createRef, useEffect, useState } from "react";
import styled, { CSSProperties } from "styled-components";
import { adjustFontSize } from "./AdjustFontSize";
import { FUSEN_WIDTH, FUSEN_HEIGHT, FUSEN_BORDER } from "./fusen_dimension";
import {  FusenItem } from "./initializeGlobalState";
import { onFusenDragStart, onFusenMouseDown } from "./mouseEventMamager";
import { show_menu } from "./show_menu";
import { TOffset } from "./TOffset";

type Props = {
  value: FusenItem;
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
  border: #aaa ${FUSEN_BORDER}px solid;
  position: absolute;
  line-height: 0.9;
  user-select: none;
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

  const onClick = (event: React.MouseEvent) => {
    show_menu("Fusen", event);
  };
  const onDragStart = (e: React.DragEvent<HTMLDivElement>) =>
    onFusenDragStart(e, value);

  return (
    <FusenDiv
      className="fusen"
      ref={self}
      data-testid={value.id}
      key={value.id}
      style={style}
      onClick={onClick}
      onMouseDown={onFusenMouseDown}
      onDragStart={onDragStart}
      draggable={true}
    >
      <FusenDiv2>{value.text}</FusenDiv2>
    </FusenDiv>
  );
};


