import { useRef } from "react";
import { getGlobal } from "reactn";
import { ids_to_dom } from "../Canvas/ids_to_dom";
import { BORDER, PADDING, TITLE_HEIGHT } from "../dimension/get_bounding_box";
import { get_group_bounding_box } from "../dimension/get_group_bounding_box";
import { is_draggeing } from "../Event/fast_drag_manager";
import { onGroupMouseUp } from "../Event/mouseEventMamager";
import { onGroupMouseDown } from "../Event/onGroupMouseDown";
import { ItemId, NameplateId } from "../Global/initializeGlobalState";
import { KOZANE_HEIGHT, KOZANE_WIDTH } from "../Kozane/kozane_constants";
import { NameplateKozane } from "../Kozane/NameplateKozane";
import { GroupBack, GroupDiv, GroupTitle } from "./GroupDiv";
import { GroupItem, TGroupItem } from "./GroupItem";
import {
  CLOSED_GROUP_BORDER_COLOR,
  GROUP_BORDER_COLOR,
} from "./group_constants";
import { highlight_group, highlight_parent } from "./highlight_group";

export const Group: React.FC<Props> = ({ value, offset }) => {
  const self = useRef<HTMLDivElement>(null);

  const onMouseEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (!is_draggeing()) return;
    highlight_group(value.id, true);
    highlight_parent(value.id, false);
    e.stopPropagation();
  };
  const onMouseLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!is_draggeing()) return;
    highlight_group(value.id, false);
    highlight_parent(value.id, true);
    e.stopPropagation();
  };

  const onMouseUp = (e: React.DragEvent<HTMLDivElement>) => {
    if (self.current !== null) {
      self.current.style.borderColor = GROUP_BORDER_COLOR;
    }
    onGroupMouseUp(e, value);
  };

  // let dragging_self = false;
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // dragging_self = true;
    onGroupMouseDown(e, value);
  };

  if (value.isOpen === false) {
    const { style, new_offset, text } = calc_closed_style(value);
    return (
      <GroupDiv
        style={style}
        key={value.id}
        data-testid={value.id}
        id={"group-" + value.id}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
      >
        <GroupBack />
        <NameplateKozane
          offset={new_offset}
          value={{
            ...value,
            text,
            id: get_nameplate_id(value.id),
          }}
        />
      </GroupDiv>
    );
  }
  const { style, title_height, title, new_offset } = calc_style(value, offset);

  return (
    <GroupDiv
      ref={self}
      style={style}
      key={value.id}
      id={"group-" + value.id}
      data-testid={value.id}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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

const get_nameplate_id = (kozaneId: ItemId): NameplateId => {
  return ("nameplate-" + kozaneId) as NameplateId;
};
function calc_closed_style(value: TGroupItem) {
  const [x, y] = value.position;
  const scale = value.scale;
  const width = KOZANE_WIDTH * scale + PADDING * 2;
  const height = KOZANE_HEIGHT * scale + PADDING * 2;
  const top = y - height / 2 - BORDER;
  const left = x - width / 2 - BORDER;

  const style = {
    top,
    left,
    height,
    width,
    borderColor: CLOSED_GROUP_BORDER_COLOR,
  };
  const new_offset = {
    x: width / 2,
    y: height / 2,
  };
  const text = get_group_title(value).replace("\n", " ");
  // need to keep "\n" for future edit, but need to be space for better rendering

  return { style, new_offset, text };
}

export const get_group_title = (group: GroupItem): string => {
  let text = group.text;
  if (text === "") {
    const itemStore = getGlobal().itemStore;
    text = group.items.map((x) => itemStore[x].text).join("\n");
  }
  return text;
};
