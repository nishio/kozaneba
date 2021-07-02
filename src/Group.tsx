import React from "react";
import styled from "styled-components";
import { idToDom } from "./idToDom";
import { GroupItem, ItemId } from "./initializeGlobalState";
import { getBoundingBox as getFusenBoundingBox } from "./Fusen";
import { getGlobal } from "reactn";

const PADDING = 50;
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
  return { left, right, top, bottom };
};

export const Group: React.FC<Props> = ({ value, id }) => {
  const b = getGroupBoundingBox(value);
  const style = {
    top: b.top,
    left: b.left,
    height: b.bottom - b.top,
    width: b.right - b.left,
  };
  return (
    <>
      <GroupDiv style={style}></GroupDiv>
      {value.items.map(idToDom)}
    </>
  );
};
type Props = {
  value: GroupItem;
  id?: string;
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
  border: 5px solid #ccc;
  position: absolute;
`;
