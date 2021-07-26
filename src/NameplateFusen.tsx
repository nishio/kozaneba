import React, { createRef, useEffect, useState } from "react";
import { CSSProperties } from "styled-components";
import { adjustFontSize } from "./AdjustFontSize";
import { FUSEN_WIDTH, FUSEN_HEIGHT } from "./fusen_dimension";
import { onFusenMouseDown } from "./mouseEventMamager";
import { TOffset } from "./TOffset";
import { FusenDiv, FusenDiv2 } from "./Fusen";


export const NameplateFusen: React.FC<PropsNameplate> = ({
  value, offset, custom_style = {},
}) => {
  let [fontSize, setFontSize] = useState(1);
  const self = createRef<HTMLDivElement>();
  const x = 0;
  const y = 0;
  const scale = value.scale;
  const text = value.text;

  useEffect(() => {
    setFontSize(adjustFontSize(text) * scale);
  }, [text, scale]);

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

  return (
    <FusenDiv
      className="fusen"
      ref={self}
      data-testid={value.id}
      key={value.id}
      style={style}
      onMouseDown={onFusenMouseDown}
      draggable={true}
    >
      <FusenDiv2>{text}</FusenDiv2>
    </FusenDiv>
  );
};
type PropsNameplate = {
  value: { text: string; id: string; scale: number; };
  offset: TOffset;
  custom_style?: CSSProperties;
};
