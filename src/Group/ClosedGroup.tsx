import React from "react";
import { NameplateKozane } from "../Kozane/NameplateKozane";
import { KOZANE_HEIGHT, KOZANE_WIDTH } from "../Kozane/kozane_constants";

import { GroupBack, GroupDiv } from "./GroupDiv";
import { PADDING, BORDER } from "../dimension/get_bounding_box";
import { GroupItem, TGroupItem } from "./GroupItem";
import { getGlobal } from "reactn";

export type Props = {
  value: TGroupItem;
  offset: { x: number; y: number };
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export const get_group_title = (group: GroupItem): string => {
  let text = group.text;
  if (text === "") {
    const itemStore = getGlobal().itemStore;
    text = group.items.map((x) => itemStore[x].text).join("\n");
  }
  return text;
};

export const ClosedGroup: React.FC<Props> = ({ offset, value, onClick }) => {
  const [x, y] = value.position;
  const scale = value.scale;
  const width = KOZANE_WIDTH + PADDING * 2;
  const height = KOZANE_HEIGHT + PADDING * 2;
  const top = y - (height / 2) * scale - BORDER;
  const left = x - (width / 2) * scale - BORDER;

  const style = { top, left, height, width };
  const new_offset = {
    x: width / 2,
    y: height / 2,
  };
  const text = get_group_title(value).replace("\n", " ");
  // need to keep "\n" for future edit, but need to be space for better rendering
  return (
    <GroupDiv
      style={style}
      key={value.id}
      data-testid={value.id}
      onClick={onClick}
    >
      <GroupBack />
      <NameplateKozane
        offset={new_offset}
        value={{
          ...value,
          text,
          id: "nameplate-" + value.id,
        }}
      />
    </GroupDiv>
  );
};
