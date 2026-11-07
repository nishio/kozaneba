import { getGlobal, setGlobal } from "reactn";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { ItemRepulse } from "./ItemRepulse";
import { step } from "./physics";

vi.mock("../API/redraw", () => ({ redraw: vi.fn() }));

const kozane = (id: string, position: [number, number]) => ({
  type: "kozane",
  id,
  text: id,
  position,
  scale: 1,
});

const coincident = () => {
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    drawOrder: ["A", "B"],
    itemStore: { A: kozane("A", [0, 0]), B: kozane("B", [0, 0]) },
    annotations: [],
  } as any);
};

const is_finite_v2 = (v: number[]) =>
  Number.isFinite(v[0]) && Number.isFinite(v[1]);

describe("physics with items at the same point", () => {
  beforeEach(coincident);

  test("ItemRepulse gives a finite push that separates them", () => {
    const grad = ItemRepulse(getGlobal());
    expect(is_finite_v2(grad["A"]!)).toBe(true);
    expect(is_finite_v2(grad["B"]!)).toBe(true);
    expect(grad["A"]).not.toEqual([0, 0]);
    expect(grad["A"]![0]).toBeCloseTo(-grad["B"]![0]);
  });

  test("step keeps positions finite, separates the items, and keeps running", () => {
    step();
    const { A, B } = getGlobal().itemStore;
    expect(is_finite_v2(A!.position)).toBe(true);
    expect(is_finite_v2(B!.position)).toBe(true);
    expect(A!.position).not.toEqual(B!.position);
    expect(() => step()).not.toThrow();
  });
});
