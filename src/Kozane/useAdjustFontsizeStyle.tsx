import { useEffect, useState } from "react";
import { CSSProperties } from "styled-components";
import { adjustFontSize } from "../Canvas/AdjustFontSize";
import { KOZANE_WIDTH, KOZANE_HEIGHT, KOZANE_BORDER } from "./kozane_constants";
import { TOffset } from "../dimension/TOffset";
import { TMinimumKozaneItem } from "./TMinimumKozaneItem";
import { TKozaneItem } from "./KozaneItem";
import { position_to_left_top } from "../dimension/position_to_left_top";
import { add_v2w } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";

export const useAdjustFontsizeStyle = (
  value: TMinimumKozaneItem | TKozaneItem,
  offset: TOffset
) => {
  let [fontSize, setFontSize] = useState(1);
  const { text, scale } = value;
  const o = [
    offset.x - (scale * KOZANE_WIDTH) / 2 - KOZANE_BORDER,
    offset.y - (scale * KOZANE_HEIGHT) / 2 - KOZANE_BORDER,
  ] as TWorldCoord;
  const left_top = position_to_left_top(add_v2w(value.position, o));
  useEffect(() => {
    setFontSize(adjustFontSize(text) * scale);
  }, [text, scale]);

  const style: CSSProperties = {
    fontSize,
    ...left_top,
    width: KOZANE_WIDTH * scale + "px",
    height: KOZANE_HEIGHT * scale + "px",
  };
  const tooLong = fontSize === 0;
  if (tooLong) {
    style.fontSize = 1;
    style.alignItems = "flex-start";
  }

  return style;
};
