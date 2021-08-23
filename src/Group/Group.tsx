import { useRef } from "react";
import { getGlobal } from "reactn";
import { ids_to_dom } from "../Canvas/ids_to_dom";
import { is_draggeing } from "../Event/fast_drag_manager";
import { get_item } from "../Event/get_item";
import { onGroupMouseUp } from "../Event/mouseEventMamager";
import { onGroupMouseDown } from "../Event/onGroupMouseDown";
import { ItemId, NameplateId } from "../Global/initializeGlobalState";
import { NameplateKozane } from "../Kozane/NameplateKozane";
import { calc_closed_style } from "./calc_closed_style";
import { calc_style } from "./calc_style";
import { GroupBack, GroupDiv, GroupTitle } from "./GroupDiv";
import { GroupItem, TGroupItem } from "./GroupItem";
import { GROUP_BORDER_COLOR } from "./group_constants";
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
  const common_props = {
    key: value.id,
    "data-testid": value.id,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseUp,
    id: "group-" + value.id,
  };

  if (value.isOpen === false) {
    const { style, new_offset, text } = calc_closed_style(value, offset);
    return (
      <GroupDiv style={style} {...common_props}>
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
    <GroupDiv ref={self} style={style} {...common_props}>
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

const get_nameplate_id = (kozaneId: ItemId): NameplateId => {
  return ("nameplate-" + kozaneId) as NameplateId;
};
export const get_group_title = (group: GroupItem): string => {
  let text = group.text;
  if (text === "") {
    const g = getGlobal();
    text = group.items.map((x) => get_item(g, x).text).join("\n");
  }
  return text;
};
