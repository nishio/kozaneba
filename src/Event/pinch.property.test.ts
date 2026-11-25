import fc from "fast-check";
import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import {
  screen_to_world_with_viewport,
  TScreenCoord,
  TViewportTransform,
  TWorldCoord,
} from "../dimension/world_to_screen";
import { TInputEvent } from "./input_event";
import { pinch_transform } from "./pinch_transform";

// Property-based checks of the two-finger pinch (fast-check): the pure math
// (pinch_transform) and the real pointer handlers that feed it
// (pinch_gesture.ts), driven with touch pointer events and the real global
// state.
//
// What a pinch should do (pinch_transform.ts / pinch_gesture.ts comments):
//   (a) the world point under the fingers' midpoint stays under the midpoint,
//   (b) scale changes by the ratio of the finger distances,
//   (c) a move in which no finger moved does not change the view.
// The app has no lower or upper bound on scale (see
// src/dimension/world_to_screen.property.test.ts), so "scale stays positive
// and finite" is the only bound there is to check.
//
// Tolerances are relative: the view is a handful of float ops per move, and a
// gesture of n moves composes n of them, so we allow 1e-9 relative error,
// many orders above the ~n*1e-16 the math produces and many orders below the
// errors a wrong formula makes.

vi.mock("./fast_drag_manager", () => ({
  capture_pointer_id_on_canvas: vi.fn(),
  is_draggeing: () => false,
  release_pointer_capture: vi.fn(),
  reset_target: vi.fn(),
}));
vi.mock("./drop_target", () => ({ clear_drop_group_highlight: vi.fn() }));

import {
  pinch_pointer_down,
  pinch_pointer_move,
  pinch_pointer_up,
} from "./pinch_gesture";

const PARAMS = { seed: 20261125, numRuns: 300 };
const WIDTH = 1024;
const HEIGHT = 768;
const CENTER = [WIDTH / 2, HEIGHT / 2] as TScreenCoord;

const touch = (pointerId: number, [x, y]: TScreenCoord) =>
  ({
    pointerId,
    pointerType: "touch",
    isPrimary: pointerId === 1,
    clientX: x,
    clientY: y,
  }) as unknown as TInputEvent<Element>;

const view = (): TViewportTransform => {
  const g = getGlobal();
  return {
    width: WIDTH,
    height: HEIGHT,
    scale: g.scale,
    trans_x: g.trans_x,
    trans_y: g.trans_y,
  };
};

const setView = (scale: number, trans: TWorldCoord) =>
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    scale,
    trans_x: trans[0],
    trans_y: trans[1],
    selectionRange: { top: 0, left: 0, width: 0, height: 0 },
  } as unknown as State);

const dist = (a: TScreenCoord, b: TScreenCoord) =>
  Math.hypot(a[0] - b[0], a[1] - b[1]);
const mid = (a: TScreenCoord, b: TScreenCoord) =>
  [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as TScreenCoord;

const closeRel = (actual: number, expected: number, scaleOfValues: number) =>
  Math.abs(actual - expected) <= 1e-9 * Math.max(1, Math.abs(scaleOfValues));

const expectWorldClose = (
  actual: TWorldCoord,
  expected: TWorldCoord,
  magnitude: number
) => {
  for (const axis of [0, 1] as const) {
    if (!closeRel(actual[axis], expected[axis], magnitude)) {
      throw new Error(
        `world point moved: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`
      );
    }
  }
};

// finger positions: anywhere on the screen, never two fingers on the same
// pixel (see the separate "fingers at the same point" test)
const pointArb = fc
  .tuple(
    fc.double({ min: 0, max: WIDTH, noNaN: true }),
    fc.double({ min: 0, max: HEIGHT, noNaN: true })
  )
  .map(([x, y]) => [x, y] as TScreenCoord);
const scaleArb = fc
  .double({ min: -2, max: 2, noNaN: true })
  .map((e) => Math.pow(10, e));
const transArb = fc
  .tuple(
    fc.double({ min: -1e5, max: 1e5, noNaN: true }),
    fc.double({ min: -1e5, max: 1e5, noNaN: true })
  )
  .map(([x, y]) => [x, y] as TWorldCoord);
const MIN_FINGER_DIST = 1; // px
const pairArb = fc
  .tuple(pointArb, pointArb)
  .filter(([a, b]) => dist(a, b) >= MIN_FINGER_DIST);

beforeAll(() => {
  Object.defineProperty(document.body, "clientWidth", {
    configurable: true,
    value: WIDTH,
  });
  Object.defineProperty(document.body, "clientHeight", {
    configurable: true,
    value: HEIGHT,
  });
});

afterEach(() => {
  // lift every finger the tests may have left down
  for (const id of [1, 2, 3]) pinch_pointer_up(touch(id, [0, 0] as TScreenCoord));
});

describe("pinch_transform (pure math)", () => {
  test("the world point under m0 before is under m1 after, and scale is s0 * ratio", () => {
    fc.assert(
      fc.property(
        pointArb,
        pointArb,
        scaleArb,
        transArb,
        fc.double({ min: -2, max: 2, noNaN: true }).map((e) => Math.pow(10, e)),
        (m0, m1, s0, t0, ratio) => {
          const before: TViewportTransform = {
            width: WIDTH,
            height: HEIGHT,
            scale: s0,
            trans_x: t0[0],
            trans_y: t0[1],
          };
          const { scale, trans } = pinch_transform(CENTER, m0, m1, s0, t0, ratio);
          expect(scale).toBe(s0 * ratio);
          const after = { ...before, scale, trans_x: trans[0], trans_y: trans[1] };
          const w0 = screen_to_world_with_viewport(m0, before);
          const w1 = screen_to_world_with_viewport(m1, after);
          const magnitude =
            Math.abs(t0[0]) + Math.abs(t0[1]) + WIDTH / Math.min(s0, scale);
          expectWorldClose(w1, w0, magnitude);
        }
      ),
      PARAMS
    );
  });
});

describe("pinch_gesture (real pointer handlers)", () => {
  test("two fingers: over any sequence of moves, (a) and (b) hold for the whole gesture", () => {
    // Each move anchors the point under the previous midpoint to the new one,
    // so by induction the world point under the first midpoint ends under the
    // last midpoint, and the scale ratios multiply to dist_last / dist_first.
    const moveArb = fc.record({ finger: fc.constantFrom(1, 2), to: pointArb });
    fc.assert(
      fc.property(
        pairArb,
        fc.array(moveArb, { minLength: 1, maxLength: 20 }),
        scaleArb,
        transArb,
        ([a, b], moves, s0, t0) => {
          setView(s0, t0);
          const pos = new Map<number, TScreenCoord>([
            [1, a],
            [2, b],
          ]);
          expect(pinch_pointer_down(touch(1, a))).toBe(false);
          expect(pinch_pointer_down(touch(2, b))).toBe(true);
          const v0 = view();
          const w0 = screen_to_world_with_viewport(mid(a, b), v0);
          for (const m of moves) {
            const other = pos.get(m.finger === 1 ? 2 : 1)!;
            // keep the fingers apart (see the separate test for touching)
            if (dist(m.to, other) < MIN_FINGER_DIST) continue;
            pos.set(m.finger, m.to);
            expect(pinch_pointer_move(touch(m.finger, m.to))).toBe(true);
          }
          const a1 = pos.get(1)!;
          const b1 = pos.get(2)!;
          const v1 = view();
          const scaleRatio = v1.scale / v0.scale;
          const distRatio = dist(a1, b1) / dist(a, b);
          if (!closeRel(scaleRatio, distRatio, distRatio)) {
            throw new Error(`scale ratio ${scaleRatio} != distance ratio ${distRatio}`);
          }
          const w1 = screen_to_world_with_viewport(mid(a1, b1), v1);
          const minScale = Math.min(v0.scale, v1.scale, s0);
          const magnitude =
            Math.abs(t0[0]) + Math.abs(t0[1]) + (WIDTH * 4) / minScale;
          expectWorldClose(w1, w0, magnitude);
          pinch_pointer_up(touch(1, a1));
          pinch_pointer_up(touch(2, b1));
        }
      ),
      PARAMS
    );
  });

  // Counterexample (fast-check, seed 20261125, shrunk): fingers 1 (1,0),
  // 2 (0,1), 3 (0,0) down; finger 1 lifts; finger 3 reports (0,0) again ->
  // scale 1 -> 0.707 and a pan. Pinned below as a plain test with round
  // numbers: three fingers down, the first one lifts, then a finger "moves"
  // to where it already is. pinch_pointer_up leaves prevDist/prevMid
  // as they were for fingers 1-2, but firstTwo() now returns fingers 2-3, so
  // the next move compares the new pair against the old pair: the view jumps
  // (scale by dist(2,3)/dist(1,2), and a pan by the midpoint difference)
  // although nothing moved. Fixed by recomputing prevDist/prevMid in
  // pinch_pointer_up when the pair changes.
  test(
    "three fingers: (c) a move in which no finger moved does not change the view (fixed in #145)",
    () => {
      const eventArb = fc.oneof(
        fc.record({
          kind: fc.constant("move" as const),
          finger: fc.constantFrom(1, 2, 3),
          to: pointArb,
        }),
        fc.record({
          kind: fc.constant("stay" as const),
          finger: fc.constantFrom(1, 2, 3),
        }),
        fc.record({
          kind: fc.constant("up" as const),
          finger: fc.constantFrom(1, 2, 3),
        })
      );
      fc.assert(
        fc.property(
          fc.tuple(pointArb, pointArb, pointArb),
          fc.array(eventArb, { minLength: 1, maxLength: 12 }),
          ([a, b, c], events) => {
            fc.pre(dist(a, b) >= 1 && dist(b, c) >= 1 && dist(a, c) >= 1);
            setView(1, [0, 0] as TWorldCoord);
            const pos = new Map<number, TScreenCoord>([
              [1, a],
              [2, b],
              [3, c],
            ]);
            pinch_pointer_down(touch(1, a));
            pinch_pointer_down(touch(2, b));
            pinch_pointer_down(touch(3, c));
            for (const e of events) {
              if (!pos.has(e.finger)) continue;
              if (e.kind === "up") {
                pinch_pointer_up(touch(e.finger, pos.get(e.finger)!));
                pos.delete(e.finger);
              } else if (e.kind === "move") {
                const others = [...pos].filter(([f]) => f !== e.finger);
                if (others.some(([, p]) => dist(p, e.to) < 1)) continue;
                pos.set(e.finger, e.to);
                pinch_pointer_move(touch(e.finger, e.to));
              } else {
                const before = view();
                pinch_pointer_move(touch(e.finger, pos.get(e.finger)!));
                const after = view();
                if (
                  !closeRel(after.scale, before.scale, before.scale) ||
                  !closeRel(after.trans_x, before.trans_x, WIDTH / after.scale) ||
                  !closeRel(after.trans_y, before.trans_y, WIDTH / after.scale)
                ) {
                  throw new Error(
                    `view changed without any finger moving: ${JSON.stringify(before)} -> ${JSON.stringify(after)}`
                  );
                }
              }
            }
            for (const f of [...pos.keys()]) pinch_pointer_up(touch(f, pos.get(f)!));
          }
        ),
        PARAMS
      );
    }
  );

  test("three fingers, the first lifts: a move in place does not change the view (minimal case, fixed in #145)", () => {
    setView(1, [0, 0] as TWorldCoord);
    const p1 = [0, 0] as TScreenCoord;
    const p2 = [100, 0] as TScreenCoord;
    const p3 = [300, 0] as TScreenCoord;
    pinch_pointer_down(touch(1, p1));
    pinch_pointer_down(touch(2, p2));
    pinch_pointer_down(touch(3, p3));
    pinch_pointer_up(touch(1, p1));
    // finger 3 reports its position again without moving
    pinch_pointer_move(touch(3, p3));
    // actual: scale 2 (= dist(2,3) / dist(1,2) = 200 / 100), trans moved
    expect(getGlobal().scale).toBe(1);
    expect([getGlobal().trans_x, getGlobal().trans_y]).toEqual([0, 0]);
  });

  // Counterexample (fast-check, seed 20261125, shrunk): fingers at (19,13)
  // and (0,0); finger 2 moves onto (19,13). Two fingers on the same pixel: the
  // distance ratio is 0, so scale becomes 0 and trans becomes -Infinity/NaN
  // (pinch_transform divides by the new scale). Every later zoom multiplies
  // 0 (pinch, wheel, hotkeys), so only fit-to-contents or a reload brings the
  // board back. Physically two fingertips cannot report the same point, so
  // this is a hardening issue more than a reachable bug; see the PR.
  test("scale stays positive and finite even if both fingers meet (hardening, fixed in #145)", () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.integer({ min: 0, max: 20 }), fc.integer({ min: 0, max: 20 })),
        fc.tuple(fc.integer({ min: 0, max: 20 }), fc.integer({ min: 0, max: 20 })),
        fc.array(
          fc.record({
            finger: fc.constantFrom(1, 2),
            to: fc.tuple(fc.integer({ min: 0, max: 20 }), fc.integer({ min: 0, max: 20 })),
          }),
          { maxLength: 6 }
        ),
        (a, b, moves) => {
          fc.pre(a[0] !== b[0] || a[1] !== b[1]);
          setView(1, [0, 0] as TWorldCoord);
          pinch_pointer_down(touch(1, a as TScreenCoord));
          pinch_pointer_down(touch(2, b as TScreenCoord));
          const last = new Map([[1, a], [2, b]]);
          for (const m of moves) {
            pinch_pointer_move(touch(m.finger, m.to as TScreenCoord));
            last.set(m.finger, m.to);
          }
          const g = getGlobal();
          pinch_pointer_up(touch(1, last.get(1) as TScreenCoord));
          pinch_pointer_up(touch(2, last.get(2) as TScreenCoord));
          return (
            g.scale > 0 &&
            Number.isFinite(g.scale) &&
            Number.isFinite(g.trans_x) &&
            Number.isFinite(g.trans_y)
          );
        }
      ),
      PARAMS
    );
  });
});
