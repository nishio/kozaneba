import React, { useRef } from "react";
import { getGlobal } from "reactn";
import { ClosedGroup } from "./ClosedGroup";
import { TITLE_HEIGHT, BORDER } from "../dimension/get_bounding_box";
import { ids_to_dom } from "../Canvas/ids_to_dom";
import { TGroupItem } from "./GroupItem";
import { onGroupMouseUp } from "../Event/mouseEventMamager";
import { onGroupMouseDown } from "../Event/onGroupMouseDown";
import { GroupBack, GroupDiv, GroupTitle } from "./GroupDiv";
import { get_group_bounding_box } from "../dimension/get_group_bounding_box";
import {
  GROUP_HIGHLIGHTED_BORDER_COLOR,
  GROUP_BORDER_COLOR,
} from "./group_constants";
import { show_menu } from "../Menu/show_menu";
import { updateGlobal } from "../Global/updateGlobal";
import {
  is_dragged,
  is_draggeing,
  set_target,
} from "../Event/fast_drag_manager";

export const Group: React.FC<Props> = ({ value, offset }) => {
  const self = useRef<HTMLDivElement>(null);

  const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (is_dragged()) return;
    console.log("onGroupClick");
    updateGlobal((g) => {
      g.clicked_group = value.id;
    });
    show_menu("Group", e);
  };

  let enter_count = 0;
  const onMouseOver = (e: React.DragEvent<HTMLDivElement>) => {
    console.log("onMouseOver", value.id, is_draggeing(), dragging_self);
    if (!is_draggeing()) return;
    if (dragging_self) return;
    enter_count++;
    if (self.current !== null) {
      self.current.style.borderColor = GROUP_HIGHLIGHTED_BORDER_COLOR;
    }
    e.stopPropagation();
  };
  const onMouseOut = (e: React.DragEvent<HTMLDivElement>) => {
    console.log("onMouseOut", value.id, is_draggeing(), dragging_self);
    if (!is_draggeing()) return;
    if (dragging_self) return;
    enter_count--;
    if (self.current !== null && enter_count === 0) {
      self.current.style.borderColor = GROUP_BORDER_COLOR;
    }
    e.stopPropagation();
  };

  const onMouseUp = (e: React.DragEvent<HTMLDivElement>) => {
    if (self.current !== null) {
      self.current.style.borderColor = GROUP_BORDER_COLOR;
    }
    onGroupMouseUp(e, value);
  };

  let dragging_self = false;
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    dragging_self = true;
    onGroupMouseDown(e, value);
  };
  if (value.isOpen === false) {
    return null;
    // <ClosedGroup
    //   offset={offset}
    //   value={value}
    //   key={value.id}
    //   data-testid={value.id}
    //   onClick={onClick}
    //   onMouseDown={onMouseDown}
    //   onDragStart={onDragStart}
    //   onDragOver={allowDrop}
    //   onDragEnter={onDragEnter}
    //   onDragLeave={onDragLeave}
    //   onDrop={onDrop}
    // />
  }
  const { style, title_height, title, new_offset } = calc_style(value, offset);

  return (
    <GroupDiv
      ref={self}
      style={style}
      key={value.id}
      data-testid={value.id}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseOver}
      onMouseLeave={onMouseOut}
      onMouseUp={onMouseUp}
    >
      <GroupBack />
      <GroupTitle
        data-testid={"grouptitle-" + value.id}
        style={{ height: title_height }}
      >
        {title}
      </GroupTitle>
      {ids_to_dom(value.items, new_offset)}
    </GroupDiv>
  );
};
export type Props = {
  value: TGroupItem;
  offset: { x: number; y: number };
};

function calc_style(value: TGroupItem, offset: { x: number; y: number }) {
  const b = get_group_bounding_box(value);
  const center_shift_x = b.left + b.right;
  const center_shift_y = b.top + b.bottom;

  const title = value.text ?? "";
  const title_height = title.length !== 0 ? TITLE_HEIGHT : 0;
  const width = b.right - b.left;
  const height = b.bottom - b.top;
  const relative_x = value.position[0];
  const relative_y = value.position[1];
  const top = offset.y + b.top - BORDER;
  const left = offset.x + b.left - BORDER;
  const style = { top, left, height, width };
  const new_offset = {
    x: width / 2 - center_shift_x / 2 + relative_x,
    y: height / 2 - center_shift_y / 2 + relative_y,
  };
  return { style, title_height, title, new_offset };
}
