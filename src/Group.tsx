import React, { useRef } from "react";
import { getGlobal } from "reactn";
import styled from "styled-components";
import { ClosedGroup } from "./ClosedGroup";
import { getGroupBoundingBox, TITLE_HEIGHT, BORDER } from "./get_bounding_box";
import { idsToDom } from "./idsToDom";
import { GroupItem } from "./initializeGlobalState";
import {
  allowDrop,
  onGroupDragStart,
  onGroupDrop,
  onGroupMouseDown,
} from "./mouseEventMamager";

export const GROUP_BORDER_COLOR = "#ddd";
export const GROUP_HIGHLIGHTED_BORDER_COLOR = "#888";

export const Group: React.FC<Props> = ({ value, offset }) => {
  const self = useRef<HTMLDivElement>(null);
  if (value.isOpen === false) {
    return <ClosedGroup offset={offset} value={value} />;
  }
  const b = getGroupBoundingBox(value);
  const center_shift_x = b.left + b.right;
  const center_shift_y = b.top + b.bottom;

  const title = value.title ?? "";
  const title_height = title.length !== 0 ? TITLE_HEIGHT : 0;
  const width = b.right - b.left;
  const height = b.bottom - b.top + title_height;
  const relative_x = value.position[0];
  const relative_y = value.position[1];
  const top = offset.y + b.top - BORDER;
  const left = offset.x + b.left - BORDER;
  const style = { top, left, height, width };
  const new_offset = {
    x: width / 2 - center_shift_x / 2 + relative_x,
    y: (height + title_height) / 2 - center_shift_y / 2 + relative_y,
  };
  const onDragStart = (e: React.DragEvent<HTMLDivElement>) =>
    onGroupDragStart(e, value);

  let enter_count = 0;
  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    enter_count++;
    if (self.current !== null) {
      self.current.style.borderColor = GROUP_HIGHLIGHTED_BORDER_COLOR;
    }
    e.stopPropagation();
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    enter_count--;
    console.log(getGlobal().drag_target);
    if (self.current !== null && enter_count === 0) {
      self.current.style.borderColor = GROUP_BORDER_COLOR;
    }
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (self.current !== null) {
      self.current.style.borderColor = GROUP_BORDER_COLOR;
    }
    onGroupDrop(e, value);
  };
  return (
    <GroupDiv
      ref={self}
      style={style}
      key={value.id}
      data-testid={value.id}
      onMouseDown={onGroupMouseDown}
      onDragStart={onDragStart}
      draggable={true}
      onDragOver={allowDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <GroupTitle
        data-testid={"grouptitle-" + value.id}
        style={{ height: title_height }}
      >
        {title}
      </GroupTitle>
      {idsToDom(value.items, new_offset)}
    </GroupDiv>
  );
};
export type Props = {
  value: GroupItem;
  offset: { x: number; y: number };
};

export const GroupDiv = styled.div`
  background: #eee;
  border: ${BORDER}px solid ${GROUP_BORDER_COLOR};
  position: absolute;
`;

const GroupTitle = styled.span`
  background: ${GROUP_BORDER_COLOR};
  position: absolute;
  font-size: 21px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: ${TITLE_HEIGHT}px;
  padding-bottom: 1px;
`;
