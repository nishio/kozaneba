import React from "react";
import styled from "styled-components";
import { GroupItem, ItemId } from "./initializeGlobalState";
import { Fusen } from "./Fusen";
import {
  FUSEN_HEIGHT,
  FUSEN_WIDTH,
  getFusenBoundingBox,
} from "./fusen_dimension";
import { getGlobal } from "reactn";
import { idsToDom } from "./idsToDom";
import { ignoreEvent, onDragStartGroup } from "./mouseEventMamager";

const PADDING = 25;
const BORDER = 5;
export const TITLE_HEIGHT = 25;

type BoundingBox = { left: number; top: number; right: number; bottom: number };

export const getGroupBoundingBox = (g: GroupItem): BoundingBox => {
  const { left, top, right, bottom } = getItemsBoundingBox(g.items);
  const [x, y] = g.position;
  return {
    left: x + left - PADDING,
    top: y + top - PADDING,
    right: x + right + PADDING,
    bottom: y + bottom + PADDING,
  };
};

export const getItemBoundingBox = (id: ItemId) => {
  const g = getGlobal();
  const x = g.itemStore[id];
  if (x.type === "piece") {
    return getFusenBoundingBox(x);
  } else if (x.type === "group") {
    return getGroupBoundingBox(x);
  }
  throw Error("not here");
};

const getItemsBoundingBox = (items: ItemId[]): BoundingBox => {
  if (items.length === 0) {
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    };
  }
  const [car, ...cdr] = items;
  let { left, right, top, bottom } = getItemBoundingBox(car);
  cdr.forEach((id) => {
    const b = getItemBoundingBox(id);
    if (b.left < left) {
      left = b.left;
    }
    if (b.top < top) {
      top = b.top;
    }
    if (b.right > right) {
      right = b.right;
    }
    if (b.bottom > bottom) {
      bottom = b.bottom;
    }
  });
  const r = { left, right, top, bottom };
  // console.log("group bounding box", r);
  return r;
};

const ClosedGroup: React.FC<Props> = ({ offset, value }) => {
  // console.log("closedGroup", offset, value.position);
  const [x, y] = value.position;
  const scale = value.scale;
  const width = FUSEN_WIDTH + PADDING * 2;
  const height = FUSEN_HEIGHT + PADDING * 2;
  const top = y - (height / 2) * scale - BORDER;
  const left = x - (width / 2) * scale - BORDER;

  const style = { top, left, height, width };
  const new_offset = {
    x: width / 2,
    y: height / 2,
  };
  return (
    <GroupDiv style={style} key={value.id} data-testid={value.id}>
      <Fusen
        offset={new_offset}
        value={{
          ...value,
          text: "A B",
          id: "nameplate-" + value.id,
          position: [0, 0],
        }}
      />
    </GroupDiv>
  );
};

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
    onDragStartGroup(e, value);

  return (
    <GroupDiv
      style={style}
      key={value.id}
      data-testid={value.id}
      onMouseDown={ignoreEvent}
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
type Props = {
  value: GroupItem;
  offset: { x: number; y: number };
};

const GroupDiv = styled.div`
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
