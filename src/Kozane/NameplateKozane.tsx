import React from "react";
import { CSSProperties } from "styled-components";
import { useAdjustFontsizeStyle } from "./useAdjustFontsizeStyle";
import { TMinimumKozaneItem } from "../Global/TMinimumKozaneItem";
import { KozaneDiv, KozaneDiv2 } from "./KozaneDiv";
import { TOffset } from "../dimension/TOffset";
import { TWorldCoord } from "../dimension/world_to_screen";
import { useGlobal } from "reactn";

export const NameplateKozane: React.FC<Props> = ({
  value,
  offset,
  custom_style = {},
}) => {
  const [print_mode] = useGlobal("print_mode");

  const style: CSSProperties = {
    ...useAdjustFontsizeStyle(
      { ...value, position: [0, 0] as TWorldCoord },
      offset,
      print_mode
    ),
    ...custom_style,
    border: "none",
    backgroundColor: "rgba(0, 0, 0, 0)",
  };

  return (
    <KozaneDiv
      className="kozane"
      data-testid={value.id}
      key={value.id}
      style={style}
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
