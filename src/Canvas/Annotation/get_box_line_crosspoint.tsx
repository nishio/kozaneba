import { TRect } from "../../dimension/TRect";
import { sub_v2, V2 } from "../../dimension/V2";

export const get_box_line_crosspoint = (start: V2, end: V2, box: TRect): V2 => {
  // console.log({ start, end, box });

  // box is around the start point
  const [x, y] = start;
  const [dx, dy] = sub_v2(end, start);
  const { top, left, width, height } = box;
  const right = left + width;
  const bottom = top + height;
  
  if (width <= 0 || height <= 0 || !(left <= x && x <= right && top <= y && y <= bottom)) {
    // Instead of throwing an error, return the start point
    return start;
  }
  
  if (dx > 0) {
    const ey = (right - x) * dy;
    if ((top - y) * dx < ey && ey < (bottom - y) * dx) {
      // crosspoint is on the right edge
      return [right, y + ey / dx];
    }
  }
  if (dx < 0) {
    const ey = (x - left) * dy;
    if ((y - top) * dx < ey && ey < (y - bottom) * dx) {
      // crosspoint is on the left edge
      return [left, y - ey / dx];
    }
  }
  if (dy < 0) {
    // crosspoint is on the top edge
    return [x + ((top - y) * dx) / dy, top];
  } else {
    // crosspoint is on the bottom edge
    return [x + ((bottom - y) * dx) / dy, bottom];
  }
};
