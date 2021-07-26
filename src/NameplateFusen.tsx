import React from "react";
import { CSSProperties } from "styled-components";
import { FusenDiv, FusenDiv2, useAjustFontsizeStyle } from "./Fusen";
import { onFusenMouseDown } from "./mouseEventMamager";
import { TOffset } from "./TOffset";


export const NameplateFusen: React.FC<Props> = ({
  value, offset, custom_style = {},
}) => {
  const style = { ...useAjustFontsizeStyle(value, offset), ...custom_style }

  return (
    <FusenDiv
      className="fusen"
      data-testid={value.id}
      key={value.id}
      style={style}
      onMouseDown={onFusenMouseDown}
      draggable={true}
    >
      <FusenDiv2>{value.text}</FusenDiv2>
    </FusenDiv>
  );
};

type Props = {
  value: { text: string; id: string; scale: number; position: number[]};
  offset: TOffset;
  custom_style?: CSSProperties;
};
