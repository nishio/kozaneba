import React from "react";
import styled from "styled-components";
import { FusenItem, GroupItem, ItemId } from "./initializeGlobalState";
import { Fusen, getBoundingBox as getFusenBoundingBox } from "./Fusen";
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
  if (value.isOpen === false) {
    return null;
    // return <ClosedGroup offset={offset} value={value}></ClosedGroup>;
  }
  const b = getGroupBoundingBox(value);
  console.log("Group", b);
  const title = value.title ?? "";
  const title_height = title.length !== 0 ? 24 : 0;
  const width = b.right - b.left;
  const height = b.bottom - b.top + title_height;
  const relative_x = value.position[0];
  const relative_y = value.position[1];
  const top = offset.y + b.top + relative_y - BORDER;
  const left = offset.x + b.left + relative_x - BORDER;
  const style = { top, left, height, width };
  const new_offset = {
    x: width / 2,
    y: (height + title_height) / 2,
  };
  return (
    <GroupDiv style={style} key={value.id} data-testid={value.id}>
      <GroupTitle>{title}</GroupTitle>
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
`;

// const AdjustableText: React.FC<{}> = () => {

// };
// export const ClosedGroup: React.FC<Props> = ({ value, offset }) => {
//   let [fontSize, setFontSize] = useState(1);
//   const self = createRef<HTMLDivElement>();
//   const x = value.position[0] ?? 0;
//   const y = value.position[1] ?? 0;
//   const scale = value.scale;

//   useEffect(() => {
//     setFontSize(adjustFontSize(value.text) * scale);
//   }, [value.text, scale]);

//   const style: CSSProperties = {
//     fontSize,
//     left: offset.x + x - (scale * FUSEN_WIDTH) / 2 + "px",
//     top: offset.y + y - (scale * FUSEN_HEIGHT) / 2 + "px",
//     width: FUSEN_WIDTH * scale + "px",
//     height: FUSEN_HEIGHT * scale + "px",
//   };
//   const tooLong = fontSize === 0;
//   if (tooLong) {
//     style.fontSize = 1;
//     style.alignItems = "flex-start";
//   }

//   return (
//     <FusenDiv
//       className="fusen"
//       ref={self}
//       data-testid={value.id}
//       key={value.id}
//       style={style}
//     >
//       <FusenDiv2>{value.text}</FusenDiv2>
//     </FusenDiv>
//   );
// };
