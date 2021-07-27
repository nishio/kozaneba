import React from "react";
import { NameplateFusen } from "../Fusen/NameplateFusen";
import { FUSEN_HEIGHT, FUSEN_WIDTH } from "../Fusen/fusen_constants";
import { Props } from "./Group";
import { GroupDiv } from "./GroupDiv";
import { PADDING, BORDER } from "../dimension/get_bounding_box";

export const ClosedGroup: React.FC<Props> = ({ offset, value }) => {
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
      <NameplateFusen
        offset={new_offset}
        value={{
          ...value,
          text: "A B",
          id: "nameplate-" + value.id,
        }}
      />
    </GroupDiv>
  );
};