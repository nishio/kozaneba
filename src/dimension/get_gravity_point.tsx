import { add_v2, mul_v2, V2 } from "./V2";

export const get_gravity_point = (vecs: V2[]): V2 => {
  const N = vecs.length;
  let ret: V2 = [0, 0];
  vecs.forEach((v) => {
    ret = add_v2(ret, v);
  });
  return mul_v2(1 / N, ret);
};
