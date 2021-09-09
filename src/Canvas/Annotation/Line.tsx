import { CSSProperties } from "react";
import { V2 } from "../../dimension/V2";

export const Line = (
  p1: V2,
  p2: V2,
  onClick: (() => void) | undefined,
  key: string,
  stroke_width: number,
  opacity: number,
  is_clickable: boolean
) => {
  const [x1, y1] = p1;
  const [x2, y2] = p2;

  const style: CSSProperties = {};
  if (is_clickable) {
    style.pointerEvents = "auto";
  }
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="black"
      strokeWidth={stroke_width}
      opacity={opacity}
      strokeLinecap="round"
      onClick={onClick}
      style={style}
      key={key}
    />
  );
};
