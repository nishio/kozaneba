import { TScreenCoord, TWorldCoord } from "../dimension/world_to_screen";

// Pure math for a two-finger pinch. Given the viewport center C (half the canvas
// size), the pinch midpoint before (m0) and after (m1) a move on screen, the
// current scale s0 and translation t0, and the scale ratio (newFingerDistance /
// oldFingerDistance), returns the new scale and translation such that the world
// point under m0 is placed under m1 at the new scale. With ratio === 1 this is a
// pure pan; with m0 === m1 it is a pure zoom whose center (m0) stays fixed.
//
// Screen/world relation (see world_to_screen_with_viewport):
//   screen = C + (world + trans) * scale
export type TPinch = { scale: number; trans: TWorldCoord };

export const pinch_transform = (
  center: TScreenCoord,
  m0: TScreenCoord,
  m1: TScreenCoord,
  s0: number,
  t0: TWorldCoord,
  ratio: number
): TPinch => {
  const s1 = s0 * ratio;
  // world point currently under m0: W = (m0 - C)/s0 - t0
  const wx = (m0[0] - center[0]) / s0 - t0[0];
  const wy = (m0[1] - center[1]) / s0 - t0[1];
  // place W under m1 at scale s1: t1 = (m1 - C)/s1 - W
  const tx = (m1[0] - center[0]) / s1 - wx;
  const ty = (m1[1] - center[1]) / s1 - wy;
  return { scale: s1, trans: [tx, ty] as TWorldCoord };
};
