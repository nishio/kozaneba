import { useEffect, useState } from "react";
import { CSSProperties } from "styled-components";
import { adjustFontSize } from "./AdjustFontSize";
import {
  KOZANE_WIDTH,
  KOZANE_HEIGHT,
  KOZANE_BORDER,
} from "../utils/kozane_constants";
import { TOffset } from "../dimension/TOffset";
import { TMinimumKozaneItem } from "../Global/TMinimumKozaneItem";
import { TKozaneItem } from "../Global/TKozaneItem";
import { position_to_left_top } from "../dimension/position_to_left_top";
import { add_v2w } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";

export const useAdjustFontsizeStyle = (
  value: TMinimumKozaneItem | TKozaneItem,
  offset: TOffset,
  is_print_mode: boolean
) => {
  let [fontSize, setFontSize] = useState(1);
  const { text, scale } = value;
  const o = [
    offset.x - (scale * KOZANE_WIDTH) / 2 - KOZANE_BORDER,
    offset.y - (scale * KOZANE_HEIGHT) / 2 - KOZANE_BORDER,
  ] as TWorldCoord;
  const left_top = position_to_left_top(add_v2w(value.position, o));

  const shrink_on_print = is_print_mode ? 0.8 : 1.0;
  useEffect(() => {
    setFontSize(adjustFontSize(text) * scale * shrink_on_print);
  }, [text, scale, shrink_on_print]);

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
