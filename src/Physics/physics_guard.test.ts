import { getGlobal, setGlobal } from "reactn";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { step } from "./physics";

// A law that returns a non-finite push, standing in for any future NaN source.
vi.mock("./ItemRepulse", () => ({
  ItemRepulse: () => ({ A: [NaN, NaN], B: [Infinity, 0], C: [3, 4] }),
}));
vi.mock("./LineSpring", () => ({ LineSpring: () => ({}) }));
vi.mock("../API/redraw", () => ({ redraw: vi.fn() }));

const kozane = (id: string, position: [number, number]) => ({
  type: "kozane",
  id,
  text: id,
  position,
  scale: 1,
});

test("step never writes a non-finite position", () => {
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    drawOrder: ["A", "B", "C"],
    itemStore: {
      A: kozane("A", [10, 20]),
      B: kozane("B", [30, 40]),
      C: kozane("C", [0, 0]),
    },
    annotations: [],
  } as any);
  step();
  const { A, B, C } = getGlobal().itemStore;
  expect(A!.position).toEqual([10, 20]);
  expect(B!.position).toEqual([30, 40]);
  // finite pushes are still applied (two iterations per step)
  expect(C!.position).toEqual([6, 8]);
});
