import React from "react";
import styled from "styled-components";
import { ClosedGroup } from "./ClosedGroup";
import { getGroupBoundingBox, TITLE_HEIGHT, BORDER } from "./get_bounding_box";
import { idsToDom } from "./idsToDom";
import { GroupItem } from "./initializeGlobalState";
import { onGroupDragStart, onGroupMouseDown } from "./mouseEventMamager";

export const Group: React.FC<Props> = ({ value, offset }) => {
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

  return (
    <GroupDiv
      style={style}
      key={value.id}
      data-testid={value.id}
      onMouseDown={onGroupMouseDown}
      onDragStart={onDragStart}
      draggable={true}
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
  border: ${BORDER}px solid #ddd;
  position: absolute;
`;

const GroupTitle = styled.span`
  background: #ddd;
  position: absolute;
  font-size: 21px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: ${TITLE_HEIGHT}px;
  padding-bottom: 1px;
`;
