import React from "react";
import { CSSProperties } from "styled-components";
import { useAjustFontsizeStyle } from "./useAjustFontsizeStyle";
import { TMinimumFusenItem } from "./TMinimumFusenItem";
import { FusenDiv, FusenDiv2 } from "./FusenDiv";
import { onFusenMouseDown } from "../Event/mouseEventMamager";
import { TOffset } from "../dimension/TOffset";

export const NameplateFusen: React.FC<Props> = ({
  value,
  offset,
  custom_style = {},
}) => {
  const style = {
    ...useAjustFontsizeStyle({ ...value, position: [0, 0] }, offset),
    ...custom_style,
  };

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
  value: TMinimumFusenItem;
  offset: TOffset;
  custom_style?: CSSProperties;
};
