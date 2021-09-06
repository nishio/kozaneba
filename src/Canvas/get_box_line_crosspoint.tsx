import { TRect } from "../dimension/TRect";
import { add_v2, sub_v2, V2 } from "../dimension/V2";

export const get_box_line_crosspoint = (start: V2, end: V2, box: TRect) => {
  // box is around the start point
  const [dx, dy] = sub_v2(end, start);
  var grad = dy / dx;
  var igrad = dx / dy;

  const w = box.width / 2;
  const h = box.height / 2;
  let crosspoint: V2;
  if (w * Math.abs(dy) > h * Math.abs(dx)) {
    //intersection is on the top or bottom
    if (dy > 0) {
      // top
      crosspoint = [h * igrad, h];
    } else {
      // bottom
      crosspoint = [-h * igrad, -h];
    }
  } else {
    //intersection is on the left or right
    if (dx > 0) {
      // right
      crosspoint = [w, w * grad];
    } else {
      // left
      crosspoint = [-w, -grad * w];
    }
  }
  return add_v2(start, crosspoint);
};
