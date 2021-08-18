import { TScreenCoord, TWorldCoord } from "./world_to_screen";

export type V2 = [number, number];
export const add_v2 = (v1: V2, v2: V2): V2 => {
  return [v1[0] + v2[0], v1[1] + v2[1]];
};

export const add_v2w = (v1: TWorldCoord, v2: TWorldCoord): TWorldCoord => {
  return add_v2(v1, v2) as TWorldCoord;
};

export const add_v2s = (v1: TScreenCoord, v2: TScreenCoord): TScreenCoord => {
  return add_v2(v1, v2) as TScreenCoord;
};

export const sub_v2 = (v1: V2, v2: V2): V2 => {
  return [v1[0] - v2[0], v1[1] - v2[1]];
};

export const sub_v2s = (v1: TScreenCoord, v2: TScreenCoord): TScreenCoord => {
  return sub_v2(v1, v2) as TScreenCoord;
};

export const sub_v2w = (v1: TWorldCoord, v2: TWorldCoord): TWorldCoord => {
  return sub_v2(v1, v2) as TWorldCoord;
};

export const mul_v2 = (s: number, v1: V2): V2 => {
  return [s * v1[0], s * v1[1]];
};

export const mul_v2w = (s: number, v1: TWorldCoord): TWorldCoord => {
  return mul_v2(s, v1) as TWorldCoord;
};

export const clone_v2 = (v: V2): V2 => {
  return [v[0], v[1]];
};

export const clone_v2w = (v: TWorldCoord): TWorldCoord => {
  return clone_v2(v) as TWorldCoord;
};

export const L1norm = (v: V2): number => {
  return v[0] + v[1];
};
export const L2norm = (v: V2): number => {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
};
