import { V2 } from "../../dimension/V2";

export const get_middle_point = (vecs: V2[]): V2 => {
  let [max_x, max_y] = vecs[0]!;
  let [min_x, min_y] = vecs[0]!;
  vecs.forEach(([x, y]) => {
    max_x = Math.max(max_x, x);
    max_y = Math.max(max_y, y);
    min_x = Math.min(min_x, x);
    min_y = Math.min(min_y, y);
  });
  return [(max_x + min_x) / 2, (max_y + min_y) / 2];
};
