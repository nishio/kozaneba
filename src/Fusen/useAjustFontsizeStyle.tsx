import { useEffect, useState } from "react";
import { CSSProperties } from "styled-components";
import { adjustFontSize } from "../AdjustFontSize";
import { FUSEN_WIDTH, FUSEN_HEIGHT, FUSEN_BORDER } from "./fusen_constants";
import { TOffset } from "../dimension/TOffset";
import { TMinimumFusenItem } from "./TMinimumFusenItem";

export const useAjustFontsizeStyle = (
  value: TMinimumFusenItem,
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
    left: offset.x + x - (scale * FUSEN_WIDTH) / 2 - FUSEN_BORDER + "px",
    top: offset.y + y - (scale * FUSEN_HEIGHT) / 2 - FUSEN_BORDER + "px",
    width: FUSEN_WIDTH * scale + "px",
    height: FUSEN_HEIGHT * scale + "px",
  };
  const tooLong = fontSize === 0;
  if (tooLong) {
    style.fontSize = 1;
    style.alignItems = "flex-start";
  }

  return style;
};
