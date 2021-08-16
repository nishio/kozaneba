import React from "react";
import { CSSProperties } from "styled-components";
import { useAdjustFontsizeStyle } from "./useAdjustFontsizeStyle";
import { TMinimumKozaneItem } from "./TMinimumKozaneItem";
import { KozaneDiv, KozaneDiv2 } from "./KozaneDiv";
import { onKozaneMouseDown } from "../Event/onKozaneMouseDown";
import { TOffset } from "../dimension/TOffset";

export const NameplateKozane: React.FC<Props> = ({
  value,
  offset,
  custom_style = {},
}) => {
  const style = {
    ...useAdjustFontsizeStyle({ ...value, position: [0, 0] }, offset),
    ...custom_style,
  };

  // const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) =>
  //   onKozaneMouseDown(e, value);

  return (
    <KozaneDiv
      className="kozane"
      data-testid={value.id}
      key={value.id}
      style={style}
      // onMouseDown={onMouseDown}
      // draggable={true}
    >
      <KozaneDiv2>{value.text}</KozaneDiv2>
    </KozaneDiv>
  );
};

type Props = {
  value: TMinimumKozaneItem;
  offset: TOffset;
  custom_style?: CSSProperties;
};
