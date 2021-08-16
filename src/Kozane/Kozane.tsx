import React from "react";
import { CSSProperties } from "styled-components";
import { TKozaneItem } from "./KozaneItem";
import { onKozaneMouseDown } from "../Event/onKozaneMouseDown";
import { show_menu } from "../Menu/show_menu";
import { KozaneDiv, KozaneDiv2 } from "./KozaneDiv";
import { useAdjustFontsizeStyle } from "./useAdjustFontsizeStyle";
import { TOffset } from "../dimension/TOffset";
import { updateGlobal } from "../Global/updateGlobal";
import { is_dragged, set_target } from "../Event/fast_drag_manager";

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
  const style = { ...useAdjustFontsizeStyle(value, offset), ...custom_style };

  const onClick = (event: React.MouseEvent) => {
    if (is_dragged()) return;
    console.log("onKozaneClick");
    updateGlobal((g) => {
      g.clicked_kozane = value.id;
    });
    show_menu("Kozane", event);
    event.stopPropagation();
  };
  // const onDragStart = (e: React.DragEvent<HTMLDivElement>) =>
  //   onKozaneDragStart(e, value);

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    set_target(e);
    onKozaneMouseDown(e, value);
  };

  return (
    <KozaneDiv
      className="kozane"
      data-testid={value.id}
      key={value.id}
      style={style}
      onClick={onClick}
      onMouseDown={onMouseDown}
      // onDragStart={onDragStart}
      // draggable={true}
    >
      <KozaneDiv2>{value.text}</KozaneDiv2>
    </KozaneDiv>
  );
};
