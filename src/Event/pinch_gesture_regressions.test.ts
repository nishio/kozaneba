import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TScreenCoord } from "../dimension/world_to_screen";
import { TInputEvent } from "./input_event";

// Regressions for the pinch bugs that the fast-check property tests of
// PR #144 (src/Event/pinch.property.test.ts) found, driven through the real
// pointer handlers with touch pointer events and the real global state.

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

const WIDTH = 1024;
const HEIGHT = 768;

const pt = (x: number, y: number) => [x, y] as TScreenCoord;
const touch = (pointerId: number, [x, y]: TScreenCoord) =>
  ({
    pointerId,
    pointerType: "touch",
    isPrimary: pointerId === 1,
    clientX: x,
    clientY: y,
  }) as unknown as TInputEvent<Element>;

const view = () => {
  const g = getGlobal();
  return { scale: g.scale, trans_x: g.trans_x, trans_y: g.trans_y };
};

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

beforeEach(() => {
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    scale: 1,
    trans_x: 0,
    trans_y: 0,
    selectionRange: { top: 0, left: 0, width: 0, height: 0 },
  } as unknown as State);
});

afterEach(() => {
  // lift every finger a test may have left down
  for (const id of [1, 2, 3]) pinch_pointer_up(touch(id, pt(0, 0)));
});

describe("three fingers", () => {
  test("the first finger lifts: a move in place does not change the view", () => {
    pinch_pointer_down(touch(1, pt(0, 0)));
    pinch_pointer_down(touch(2, pt(100, 0)));
    pinch_pointer_down(touch(3, pt(300, 0)));
    pinch_pointer_up(touch(1, pt(0, 0)));
    // finger 3 reports its position again without moving
    expect(pinch_pointer_move(touch(3, pt(300, 0)))).toBe(true);
    // was scale 2 (= dist(2,3) / dist(1,2) = 200 / 100) and a pan
    expect(view()).toEqual({ scale: 1, trans_x: 0, trans_y: 0 });
  });

  test("the second finger lifts: a move in place does not change the view", () => {
    pinch_pointer_down(touch(1, pt(0, 0)));
    pinch_pointer_down(touch(2, pt(100, 0)));
    pinch_pointer_down(touch(3, pt(0, 300)));
    pinch_pointer_up(touch(2, pt(100, 0)));
    pinch_pointer_move(touch(1, pt(0, 0)));
    expect(view()).toEqual({ scale: 1, trans_x: 0, trans_y: 0 });
  });

  test("after the first finger lifts, the remaining two pinch from where they are", () => {
    pinch_pointer_down(touch(1, pt(0, 0)));
    pinch_pointer_down(touch(2, pt(100, 0)));
    pinch_pointer_down(touch(3, pt(300, 0)));
    pinch_pointer_up(touch(1, pt(0, 0)));
    // fingers 2-3 spread from 200px to 400px: zoom x2
    pinch_pointer_move(touch(3, pt(500, 0)));
    expect(getGlobal().scale).toBe(2);
  });
});

describe("two fingers on (almost) the same point", () => {
  test("scale stays positive and finite, and the pinch resumes", () => {
    pinch_pointer_down(touch(1, pt(19, 13)));
    pinch_pointer_down(touch(2, pt(0, 0)));
    // finger 2 moves onto finger 1: was scale 0, trans -Infinity / NaN
    pinch_pointer_move(touch(2, pt(19, 13)));
    let v = view();
    expect(v.scale).toBe(1);
    expect(Number.isFinite(v.trans_x) && Number.isFinite(v.trans_y)).toBe(true);
    // finger 2 goes back where it was: the view is as before the pinch
    pinch_pointer_move(touch(2, pt(0, 0)));
    v = view();
    expect(v.scale).toBe(1);
    expect(v.trans_x).toBeCloseTo(0, 9);
    expect(v.trans_y).toBeCloseTo(0, 9);
  });

  test("fingers that start half a pixel apart do not zoom by a huge ratio", () => {
    pinch_pointer_down(touch(1, pt(50, 50)));
    pinch_pointer_down(touch(2, pt(50.5, 50)));
    pinch_pointer_move(touch(2, pt(150, 50)));
    // was scale 199 (99.5 / 0.5) -- now the first distance of 1px or more is
    // taken as the start of the pinch
    expect(getGlobal().scale).toBe(1);
    pinch_pointer_move(touch(2, pt(250, 50)));
    expect(getGlobal().scale).toBe(2);
  });
});
