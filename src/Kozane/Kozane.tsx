import React from "react";
import { CSSProperties } from "react";
import { TOffset } from "../dimension/TOffset";
import { onKozaneMouseDown } from "../Event/onKozaneMouseDown";
import { KozaneDiv, KozaneDiv2 } from "./KozaneDiv";
import { TKozaneItem } from "./KozaneItem";
import { useAdjustFontsizeStyle } from "./useAdjustFontsizeStyle";

type Props = {
  value: TKozaneItem;
  offset: TOffset;
  custom_style?: CSSProperties;
};

export const Kozane: React.FC<Props> = ({
  value,
  offset,
  custom_style = {},
}) => {
  const custom = value.custom?.style ?? {};
  const style = {
    ...useAdjustFontsizeStyle(value, offset),
    ...custom_style,
    ...custom,
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    onKozaneMouseDown(e, value);
  };

  return (
    <KozaneDiv
      className="kozane"
      data-testid={value.id}
      key={value.id}
      style={style}
      onMouseDown={onMouseDown}
    >
      <KozaneDiv2>{value.text}</KozaneDiv2>
    </KozaneDiv>
  );
};
