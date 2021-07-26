import React from "react";
import { CSSProperties } from "styled-components";
import { TFusenItem } from "./FusenItem";
import { onFusenDragStart, onFusenMouseDown } from "../Event/mouseEventMamager";
import { show_menu } from "../Menu/show_menu";
import { TOffset } from "../TOffset";
import { FusenDiv, FusenDiv2 } from "./FusenDiv";
import { useAjustFontsizeStyle } from "./useAjustFontsizeStyle";

type Props = {
  value: TFusenItem;
  offset: TOffset;
  custom_style?: CSSProperties;
};

export const Fusen: React.FC<Props> = ({
  value,
  offset,
  custom_style = {},
}) => {
  const style = { ...useAjustFontsizeStyle(value, offset), ...custom_style };

  const onClick = (event: React.MouseEvent) => {
    show_menu("Fusen", event);
  };
  const onDragStart = (e: React.DragEvent<HTMLDivElement>) =>
    onFusenDragStart(e, value);

  return (
    <FusenDiv
      className="fusen"
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
