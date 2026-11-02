import {
  TScreenCoord,
  TViewportTransform,
  TWorldCoord,
  world_to_screen_with_viewport,
} from "../dimension/world_to_screen";
import { pinch_transform } from "./pinch_transform";

const screen = (x: number, y: number) => [x, y] as TScreenCoord;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const viewport = (
  width: number,
  height: number,
  scale: number,
  trans: TWorldCoord
): TViewportTransform => ({
  width,
  height,
  scale,
  trans_x: trans[0],
  trans_y: trans[1],
});

describe("pinch_transform", () => {
  const C = screen(640, 400); // viewport center for 1280x800

  test("keeps the pinched world point under the moving midpoint (zoom + pan)", () => {
    const s0 = 1;
    const t0 = world(30, -20);
    const m0 = screen(500, 300);
    const m1 = screen(560, 340); // midpoint also moves (pan) while spreading
    const ratio = 1.8;

    // world point under m0 before the gesture
    const vp0 = viewport(1280, 800, s0, t0);
    const W =
      // inverse of world_to_screen: W = (m0 - C)/s0 - t0
      world((m0[0] - C[0]) / s0 - t0[0], (m0[1] - C[1]) / s0 - t0[1]);

    const { scale, trans } = pinch_transform(C, m0, m1, s0, t0, ratio);

    expect(scale).toBeCloseTo(s0 * ratio);
    // after the transform, W must map to m1
    const vp1 = viewport(1280, 800, scale, trans);
    const s = world_to_screen_with_viewport(W, vp1);
    expect(s[0]).toBeCloseTo(m1[0]);
    expect(s[1]).toBeCloseTo(m1[1]);
  });

  test("ratio 1 is a pure pan (scale unchanged, content follows the midpoint)", () => {
    const s0 = 2;
    const t0 = world(-10, 5);
    const m0 = screen(400, 400);
    const m1 = screen(450, 380);
    const { scale, trans } = pinch_transform(C, m0, m1, s0, t0, 1);
    expect(scale).toBe(2);
    // panning by the screen delta / scale
    expect(trans[0]).toBeCloseTo(t0[0] + (m1[0] - m0[0]) / s0);
    expect(trans[1]).toBeCloseTo(t0[1] + (m1[1] - m0[1]) / s0);
  });

  test("pure zoom (m0 === m1) keeps that point fixed", () => {
    const s0 = 1;
    const t0 = world(12, 34);
    const m = screen(700, 500);
    const W = world((m[0] - C[0]) / s0 - t0[0], (m[1] - C[1]) / s0 - t0[1]);
    for (const ratio of [0.5, 1.25, 2.5]) {
      const { scale, trans } = pinch_transform(C, m, m, s0, t0, ratio);
      const s = world_to_screen_with_viewport(
        W,
        viewport(1280, 800, scale, trans)
      );
      expect(s[0]).toBeCloseTo(m[0]);
      expect(s[1]).toBeCloseTo(m[1]);
    }
  });
});
