type V2 = number[]; // should be [number, number]
export const add_v2 = (v1: V2, v2: V2): V2 => {
  return [v1[0] + v2[0], v1[1] + v2[1]];
};

export const sub_v2 = (v1: V2, v2: V2): V2 => {
  return [v1[0] - v2[0], v1[1] - v2[1]];
};

export const mul_v2 = (s: number, v1: V2): V2 => {
  return [s * v1[0], s * v1[1]];
};
