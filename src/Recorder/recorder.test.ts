import { describe, expect, test } from "vitest";
import { State } from "reactn/default";
import { TWorldCoord } from "../dimension/world_to_screen";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { board_of, create_session, mask_text } from "./recorder";
import { load_sample_board } from "./sample_board";
import { diff_snapshot, snapshot } from "./snapshot";

const sample_state = () => {
  const g = JSON.parse(JSON.stringify(INITIAL_GLOBAL_STATE)) as State;
  load_sample_board(g);
  return g;
};
const ev = (type: string, pointerId: number, x: number, y: number) => ({
  type,
  pointerId,
  pointerType: "touch",
  isPrimary: pointerId === 1,
  clientX: x,
  clientY: y,
  buttons: type === "pointerup" ? 0 : 1,
});

describe("create_session", () => {
  test("records a gesture and checkpoints the state once it settles", () => {
    let t = 0;
    const g = sample_state();
    const s = create_session(() => t, () => g);
    s.record(ev("pointerdown", 1, 10, 10));
    t = 16;
    s.record(ev("pointermove", 1, 20, 10));
    g.itemStore["k1"]!.position = [-290, -150] as TWorldCoord;
    t = 32;
    s.record(ev("pointerup", 1, 20, 10));
    t = 100;
    s.tick(); // not settled yet
    t = 400;
    s.tick();
    s.tick(); // only once per gesture
    const rec = s.result({} as never);
    expect(rec.events.map((e) => e.type)).toEqual(["down", "move", "up"]);
    expect(rec.checkpoints).toHaveLength(1);
    expect(rec.checkpoints[0]!.after).toBe(3);
    expect(rec.checkpoints[0]!.state.itemStore["k1"]!.position).toEqual([-290, -150]);
    // the initial board is taken at the first event, before the change
    expect(rec.initial_board.itemStore["k1"]!.position).toEqual([-300, -150]);
  });

  test("ignores hover moves and does not checkpoint while a finger is down", () => {
    let t = 0;
    const s = create_session(() => t, () => sample_state());
    s.record({ ...ev("pointermove", 9, 1, 1), pointerType: "mouse", buttons: 0 });
    expect(s.count()).toBe(0);
    s.record(ev("pointerdown", 1, 10, 10));
    s.record(ev("pointerdown", 2, 50, 10)); // second finger: a pinch
    s.record(ev("pointerup", 1, 10, 10));
    t = 1000;
    s.tick();
    expect(s.result({} as never).checkpoints).toHaveLength(0);
    s.record(ev("pointerup", 2, 50, 10));
    t = 2000;
    s.tick();
    expect(s.result({} as never).checkpoints).toHaveLength(1);
  });
});

describe("privacy", () => {
  test("recordings carry text lengths, not text", () => {
    const g = sample_state();
    const board = JSON.stringify(board_of(g));
    const snap = JSON.stringify(snapshot(g));
    expect(board).not.toContain("drag me");
    expect(snap).not.toContain("drag me");
    expect(mask_text("ab\ncd")).toBe("xx\nxx");
  });
});

describe("diff_snapshot", () => {
  test("tolerates a few pixels, reports structure changes", () => {
    const a = snapshot(sample_state());
    const b = JSON.parse(JSON.stringify(a));
    b.itemStore.k1.position = [-298, -151];
    expect(diff_snapshot(a, b)).toEqual([]);
    b.itemStore.ga.items = ["a1", "a2"];
    b.drawOrder.push("gn");
    expect(diff_snapshot(a, b)).toEqual([
      'drawOrder ["k1","k2","k3","k4","ga","gc"] -> ["k1","k2","k3","k4","ga","gc","gn"]',
      'item ga group [["a1","a2","gn"],true] -> [["a1","a2"],true]',
    ]);
  });
});
