import React, { useRef, useMemo, useCallback } from "react";
import { getGlobal } from "reactn";
import { ids_to_dom } from "../Canvas/ids_to_dom";
import { is_draggeing } from "../Event/fast_drag_manager";
import { get_item } from "../utils/get_item";
import { onGroupMouseUp } from "../Event/onGroupMouseUp";
import { onGroupMouseDown } from "../Event/onGroupMouseDown";
import { NameplateId } from "../Global/NameplateId";
import { TItemId } from "../Global/TItemId";
import { TItem } from "../Global/TItem";
import { NameplateKozane } from "../Kozane/NameplateKozane";
import { calc_closed_style } from "./calc_closed_style";
import { calc_style } from "./calc_style";
import { GroupBack, GroupDiv, GroupTitle } from "./GroupDiv";
import { GroupItem } from "./GroupItem";
import { TGroupItem } from "../Global/TGroupItem";
import { GROUP_BORDER_COLOR } from "../utils/group_constants";
import { highlight_group, highlight_parent } from "./highlight_group";

export const Group: React.FC<Props> = React.memo(({ value, offset }) => {
  const self = useRef<HTMLDivElement>(null);
  const onMouseEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!is_draggeing()) return;
    highlight_group(value.id, true);
    highlight_parent(value.id, false);
    e.stopPropagation();
  }, [value.id]);
  const onMouseLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!is_draggeing()) return;
    highlight_group(value.id, false);
    highlight_parent(value.id, true);
    e.stopPropagation();
  }, [value.id]);

  const onMouseUp = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (self.current !== null) {
      self.current.style.borderColor = GROUP_BORDER_COLOR;
    }
    onGroupMouseUp(e, value);
  }, [value]);

  // let dragging_self = false;
  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // dragging_self = true;
    onGroupMouseDown(e, value);
  }, [value]);
  const common_props = useMemo(() => ({
    key: value.id,
    "data-testid": value.id,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseUp,
    id: "group-" + value.id,
  }), [value.id, onMouseDown, onMouseEnter, onMouseLeave, onMouseUp]);

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
});
export type Props = {
  value: TGroupItem;
  offset: { x: number; y: number };
};

const get_nameplate_id = (kozaneId: TItemId): NameplateId => {
  return ("nameplate-" + kozaneId) as NameplateId;
};

const to_text = (item: TItem): string => {
  let text = item.text;
  if (text === "") {
    if (item.type === "group") {
      const g = getGlobal();
      text = item.items.map((x) => to_text(get_item(g, x))).join("\n");
    }
  }
  return text;
};

export const get_group_title = (group: GroupItem): string => {
  return to_text(group);
};
