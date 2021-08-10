import { useEffect, useState } from "react";
import { CSSProperties } from "styled-components";
import { adjustFontSize } from "../Canvas/AdjustFontSize";
import { KOZANE_WIDTH, KOZANE_HEIGHT, KOZANE_BORDER } from "./kozane_constants";
import { TOffset } from "../dimension/TOffset";
import { TMinimumKozaneItem } from "./TMinimumKozaneItem";

export const useAjustFontsizeStyle = (
  value: TMinimumKozaneItem,
  offset: TOffset
) => {
  let [fontSize, setFontSize] = useState(1);
  const { text, scale } = value;
  const [x, y] = value.position;

  useEffect(() => {
    setFontSize(adjustFontSize(text) * scale);
  }, [text, scale]);

  const style: CSSProperties = {
    fontSize,
    left: offset.x + x - (scale * KOZANE_WIDTH) / 2 - KOZANE_BORDER + "px",
    top: offset.y + y - (scale * KOZANE_HEIGHT) / 2 - KOZANE_BORDER + "px",
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
