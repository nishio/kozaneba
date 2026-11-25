import fc from "fast-check";
import {
  screen_to_world_with_viewport,
  TScreenCoord,
  TViewportTransform,
  TWorldCoord,
  world_to_screen_with_viewport,
} from "./world_to_screen";
import { zoom_around_world_point } from "./zoom_around_world_point";

// Property-based checks of the screen/world conversion (fast-check).
//
// Ranges. The app does not clamp the view: wheel (onWheel.tsx), the 2x / 0.5x
// hotkeys (hotKey.ts), the pinch (pinch_gesture.ts) and fit_to_contents all
// multiply or set g.scale without a lower or upper bound, and trans_x/trans_y
// are free. So the ranges here are "what a long session can plausibly reach",
// not limits read from the code:
//   scale  : 1e-4 .. 1e4, log-uniform (a 10,000-kozane board fitted to the
//            screen is about 1e-2; 1e4 is far beyond anything readable)
//   trans, world points : |v| <= 1e7 (boards are a few 1e4 px across)
//   viewport size       : 0 .. 4000 px (jsdom gives 0; 4K screens)
//
// Tolerance. The conversions are a few float operations, so the round trip is
// not exact (fast-check finds that at once with toEqual). Each of the 4 ops
// adds at most one rounding of its result, and the largest intermediate value
// in world units is about |x| + |trans| + (width/2)/scale, so the error is
// bounded by a small multiple of EPSILON times that. We allow 8x, which is
// tight enough that a wrong sign or a missing term is far outside it.

const PARAMS = { seed: 20261125, numRuns: 2000 };
const EPS = Number.EPSILON;

const scaleArb = fc
  .double({ min: -4, max: 4, noNaN: true })
  .map((e) => Math.pow(10, e));
const coordArb = fc.double({ min: -1e7, max: 1e7, noNaN: true });
const sizeArb = fc.integer({ min: 0, max: 4000 });

const viewportArb: fc.Arbitrary<TViewportTransform> = fc.record({
  width: sizeArb,
  height: sizeArb,
  scale: scaleArb,
  trans_x: coordArb,
  trans_y: coordArb,
});
const worldArb = fc
  .tuple(coordArb, coordArb)
  .map(([x, y]) => [x, y] as TWorldCoord);

const worldTolerance = (v: TViewportTransform, p: TWorldCoord, axis: 0 | 1) => {
  const half = (axis === 0 ? v.width : v.height) / 2;
  const t = axis === 0 ? v.trans_x : v.trans_y;
  return 8 * EPS * (Math.abs(p[axis]) + Math.abs(t) + half / v.scale);
};

describe("world_to_screen properties (fast-check)", () => {
  test("screen_to_world(world_to_screen(w)) == w within float error", () => {
    fc.assert(
      fc.property(viewportArb, worldArb, (v, w) => {
        const back = screen_to_world_with_viewport(
          world_to_screen_with_viewport(w, v),
          v
        );
        for (const axis of [0, 1] as const) {
          expect(Math.abs(back[axis] - w[axis])).toBeLessThanOrEqual(
            worldTolerance(v, w, axis)
          );
        }
      }),
      PARAMS
    );
  });

  test("world_to_screen(screen_to_world(s)) == s within float error", () => {
    const screenArb = fc
      .tuple(fc.double({ min: -1e4, max: 1e4, noNaN: true }), fc.double({ min: -1e4, max: 1e4, noNaN: true }))
      .map(([x, y]) => [x, y] as TScreenCoord);
    fc.assert(
      fc.property(viewportArb, screenArb, (v, s) => {
        const back = world_to_screen_with_viewport(
          screen_to_world_with_viewport(s, v),
          v
        );
        for (const axis of [0, 1] as const) {
          const half = (axis === 0 ? v.width : v.height) / 2;
          const t = axis === 0 ? v.trans_x : v.trans_y;
          // in screen units: the same bound as above, multiplied by scale
          const tol =
            8 * EPS * (Math.abs(s[axis]) + half + Math.abs(t) * v.scale);
          expect(Math.abs(back[axis] - s[axis])).toBeLessThanOrEqual(tol);
        }
      }),
      PARAMS
    );
  });

  test("the round trip is not exact: a tolerance is needed", () => {
    // Documents why the properties above use a tolerance. If this ever stops
    // finding a counterexample, the conversion became exact (e.g. integer
    // scale only) and the tolerance could be dropped.
    const r = fc.check(
      fc.property(viewportArb, worldArb, (v, w) => {
        const back = screen_to_world_with_viewport(
          world_to_screen_with_viewport(w, v),
          v
        );
        return back[0] === w[0] && back[1] === w[1];
      }),
      PARAMS
    );
    expect(r.failed).toBe(true);
  });

  test("zoom_around_world_point keeps the zoom center under the same screen point", () => {
    // zoom_around_pointer (onWheel.tsx, hotkeys) passes the view center as
    // [-trans_x, -trans_y] and the world point under the mouse.
    const deltaArb = fc
      .double({ min: -1, max: 1, noNaN: true })
      .map((e) => Math.pow(10, e)); // one step: 0.1x .. 10x
    const screenArb = fc
      .tuple(fc.integer({ min: 0, max: 4000 }), fc.integer({ min: 0, max: 4000 }))
      .map(([x, y]) => [x, y] as TScreenCoord);
    fc.assert(
      fc.property(viewportArb, screenArb, deltaArb, (v, mouse, d) => {
        const w = screen_to_world_with_viewport(mouse, v);
        const [newZoom, newCenter] = zoom_around_world_point(
          v.scale,
          [-v.trans_x, -v.trans_y] as TWorldCoord,
          w,
          d
        );
        expect(newZoom).toBe(v.scale * d);
        const v2: TViewportTransform = {
          ...v,
          scale: newZoom,
          trans_x: -newCenter[0],
          trans_y: -newCenter[1],
        };
        const after = world_to_screen_with_viewport(w, v2);
        for (const axis of [0, 1] as const) {
          const half = (axis === 0 ? v.width : v.height) / 2;
          const t = axis === 0 ? v.trans_x : v.trans_y;
          // world-unit magnitude: |w| + |t| + half/scale, over a few more ops
          // (two conversions + the zoom), then to screen units by newZoom
          const worldMag =
            Math.abs(w[axis]) + Math.abs(t) + half / v.scale + half / newZoom;
          const tol = 32 * EPS * worldMag * newZoom + 8 * EPS * half;
          expect(Math.abs(after[axis] - mouse[axis])).toBeLessThanOrEqual(tol);
        }
      }),
      PARAMS
    );
  });
});
