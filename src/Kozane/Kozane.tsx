import React from "react";
import { CSSProperties } from "styled-components";
import { TKozaneItem } from "./KozaneItem";
import {
  onKozaneDragStart,
  onKozaneMouseDown,
} from "../Event/mouseEventMamager";
import { show_menu } from "../Menu/show_menu";
import { KozaneDiv, KozaneDiv2 } from "./KozaneDiv";
import { useAjustFontsizeStyle } from "./useAjustFontsizeStyle";
import { TOffset } from "../dimension/TOffset";
import { updateGlobal } from "../Global/updateGlobal";

type Props = {
  value: TKozaneItem;
  offset: TOffset;
  custom_style?: CSSProperties;
};

export const Kozane: React.FC<Props> = ({
  value,
  offset,
  custom_style = {},
}) => {
  const style = { ...useAjustFontsizeStyle(value, offset), ...custom_style };

  const onClick = (event: React.MouseEvent) => {
    updateGlobal((g) => {
      g.clicked_kozane = value.id;
    });
    show_menu("Kozane", event);
  };
  const onDragStart = (e: React.DragEvent<HTMLDivElement>) =>
    onKozaneDragStart(e, value);

  return (
    <KozaneDiv
      className="kozane"
      data-testid={value.id}
      key={value.id}
      style={style}
      onClick={onClick}
      onMouseDown={onKozaneMouseDown}
      onDragStart={onDragStart}
      draggable={true}
    >
      <KozaneDiv2>{value.text}</KozaneDiv2>
    </KozaneDiv>
  );
};
