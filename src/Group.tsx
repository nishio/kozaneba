import React from "react";
import styled from "styled-components";
import { GroupItem, ItemId } from "./initializeGlobalState";
import { getBoundingBox as getFusenBoundingBox } from "./Fusen";
import { getGlobal } from "reactn";
import { idsToDom } from "./idsToDom";

const PADDING = 25;
const BORDER = 5;
type BoundingBox = { left: number; top: number; right: number; bottom: number };
const getGroupBoundingBox = (x: GroupItem): BoundingBox => {
  const { left, top, right, bottom } = getItemsBoundingBox(x.items);

  return {
    left: left - PADDING,
    top: top - PADDING,
    right: right + PADDING,
    bottom: bottom + PADDING,
  };
};

const getItemBoundingBox = (id: ItemId) => {
  const g = getGlobal();
  const x = g.itemStore[id];
  if (x.type === "piece") {
    return getFusenBoundingBox(x);
  } else if (x.type === "group") {
    return getGroupBoundingBox(x);
  }
  throw Error("not here");
};
const getItemsBoundingBox = (items: ItemId[]) => {
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
  console.log(r);
  return r;
};

export const Group: React.FC<Props> = ({ value, offset }) => {
  const b = getGroupBoundingBox(value);
  console.log("Group", b);
  const width = b.right - b.left;
  const height = b.bottom - b.top;
  const relative_x = value.position[0];
  const relative_y = value.position[1];
  const top = offset.y + b.top + relative_y - BORDER;
  const left = offset.x + b.left + relative_x - BORDER;
  const style = { top, left, height, width };
  console.log(offset);
  const new_offset = {
    x: width / 2,
    y: height / 2,
  };
  return (
    <GroupDiv style={style} key={value.id} data-testid={value.id}>
      {idsToDom(value.items, new_offset)}
    </GroupDiv>
  );
};
type Props = {
  value: GroupItem;
  offset: { x: number; y: number };
};

/**
export const OPEN_GROUP_STROKE_COLOR = "#fff";
export const OPEN_GROUP_FILL_COLOR = "#eee";
export const CLOSE_GROUP_STROKE_WIDTH = PIECE_STROKE_WIDTH;
export const CLOSE_GROUP_STROKE_COLOR = "#fff";
export const GROUP_EXPANSION = 50;

 */
const GroupDiv = styled.div`
  background: #eee;
  border: ${BORDER}px solid #ccc;
  position: absolute;
`;
