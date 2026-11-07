import React from "react";
import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TGroupItem } from "../Global/TGroupItem";
import { TItemId } from "../Global/TItemId";
import { TWorldCoord } from "../dimension/world_to_screen";

// Regressions for the #61 blockers found in the 2026-10-27 audit
// (out_verify_code.md §5-8), driven through the real pointer handlers with
// touch pointer events.

vi.mock("firebaseui", () => ({ auth: { AuthUI: vi.fn() } }));
vi.mock("../initSentry", () => ({ Sentry: { captureMessage: vi.fn() } }));
vi.mock("../Cloud/init_firebase", () => ({
  db: {},
  auth: { onAuthStateChanged: vi.fn(), currentUser: null },
}));

import { onCanvasMouseDown } from "./onCanvasMouseDown";
import { onCanvasMouseMove } from "./onCanvasMouseMove";
import { onCanvasMouseUp } from "./onCanvasMouseUp";
import { onGenericMouseDown } from "./onGenericMouseDown";
import { is_pinching } from "./pinch_gesture";

const id = (v: string) => v as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

let canvas: HTMLDivElement;
const element = (testid: string) => {
  const el = document.createElement("div");
  el.dataset.testid = testid;
  el.style.left = "0px";
  el.style.top = "0px";
  canvas.appendChild(el);
  return el;
};

type Ev = React.PointerEvent<HTMLDivElement>;
const touch = (el: Element, pointerId: number, x: number, y: number, up = false) =>
  ({
    pointerId,
    pointerType: "touch",
    isPrimary: pointerId === 1,
    clientX: x,
    clientY: y,
    button: 0,
    buttons: up ? 0 : 1,
    currentTarget: el,
    target: el,
    stopPropagation: vi.fn(),
    preventDefault: vi.fn(),
  }) as unknown as Ev;

const board = () => {
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    drawOrder: [id("K"), id("G1"), id("G2")],
    itemStore: {
      K: { type: "kozane", id: id("K"), text: "K", position: world(0, 0), scale: 1 },
      G1: { type: "group", id: id("G1"), text: "", position: world(300, 0), items: [], scale: 1, isOpen: true },
      G2: { type: "group", id: id("G2"), text: "", position: world(600, 0), items: [], scale: 1, isOpen: true },
    },
    selectionRange: { top: 0, left: 0, width: 0, height: 0 },
  } as unknown as State);
};

beforeEach(() => {
  document.body.innerHTML = "";
  canvas = document.createElement("div");
  canvas.id = "canvas";
  document.body.appendChild(canvas);
  const anchor = document.createElement("div");
  anchor.id = "menu-anchor";
  document.body.appendChild(anchor);
  document.elementFromPoint = () => null;
  board();
});

test("§5: a pinch that starts on the canvas does not throw and leaves no selection", () => {
  // finger 1 starts a selection on empty canvas, finger 2 makes it a pinch
  expect(() => {
    onCanvasMouseDown(touch(canvas, 1, 100, 300));
    onCanvasMouseDown(touch(canvas, 2, 200, 300));
  }).not.toThrow();
  expect(is_pinching()).toBe(true);
  onCanvasMouseMove(touch(canvas, 2, 300, 300)); // spread: zoom in
  expect(getGlobal().scale).toBeGreaterThan(1);
  // finger 1 lifts first; finger 2 moves on and lifts somewhere else
  expect(() => {
    onCanvasMouseUp(touch(canvas, 1, 100, 300, true));
    onCanvasMouseMove(touch(canvas, 2, 400, 400));
    onCanvasMouseUp(touch(canvas, 2, 400, 400, true));
  }).not.toThrow();
  const g = getGlobal();
  expect(g.mouseState).toBe("");
  expect(g.selected_items).toEqual([]);
  expect(g.is_selected).toBe(false);
});

test("§6: a second finger on a group pinches instead of dropping one group into the other", () => {
  const g1 = element("G1");
  const g2 = element("G2");
  onGenericMouseDown(touch(g1, 1, 300, 0), { id: id("G1"), position: world(300, 0) });
  expect(getGlobal().drag_target).toBe("G1");
  onGenericMouseDown(touch(g2, 2, 600, 0), { id: id("G2"), position: world(600, 0) });
  expect(is_pinching()).toBe(true);
  expect(getGlobal().drag_target).toBe("");
  expect(g1.style.pointerEvents).toBe("auto"); // the drag was undone
  onCanvasMouseMove(touch(canvas, 1, 400, 0)); // the fingers come together
  onCanvasMouseMove(touch(canvas, 2, 500, 0));
  expect(() => {
    onCanvasMouseUp(touch(canvas, 1, 400, 0, true));
    onCanvasMouseUp(touch(canvas, 2, 500, 0, true));
  }).not.toThrow();
  const g = getGlobal();
  expect(g.drawOrder).toEqual(["K", "G1", "G2"]);
  expect((g.itemStore.G1 as TGroupItem).items).toEqual([]);
  expect(g.is_local_change).toBe(false);
});

test("§7: a lost up does not turn the next one-finger touch into a pinch", () => {
  onCanvasMouseDown(touch(canvas, 1, 100, 300));
  onCanvasMouseDown(touch(canvas, 2, 200, 300));
  onCanvasMouseUp(touch(canvas, 2, 200, 300, true));
  // finger 1's up never arrives (e.g. swallowed elsewhere); a new touch starts
  const next = { ...touch(canvas, 3, 100, 100), isPrimary: true } as Ev;
  onCanvasMouseDown(next);
  expect(is_pinching()).toBe(false);
  onCanvasMouseMove({ ...touch(canvas, 3, 160, 160), isPrimary: true } as Ev);
  expect(getGlobal().scale).toBe(1);
  expect(getGlobal().mouseState).toBe("selecting");
});

test("§8: a tap that jitters a few pixels is still a tap, not a drag", () => {
  const k = element("K");
  onGenericMouseDown(touch(k, 1, 50, 50), { id: id("K"), position: world(0, 0) });
  onCanvasMouseMove(touch(canvas, 1, 52, 51));
  onCanvasMouseUp(touch(canvas, 1, 52, 51, true));
  const g = getGlobal();
  expect(g.itemStore.K!.position).toEqual([0, 0]);
  expect(g.menu).toBe("Kozane");
  expect(g.is_local_change).toBe(false);
});

test("§8: a touch that moves past the slop is a drag", () => {
  const k = element("K");
  onGenericMouseDown(touch(k, 1, 50, 50), { id: id("K"), position: world(0, 0) });
  onCanvasMouseMove(touch(canvas, 1, 80, 50));
  onCanvasMouseUp(touch(canvas, 1, 80, 50, true));
  const g = getGlobal();
  expect(g.itemStore.K!.position[0]).toBeGreaterThan(0);
  expect(g.menu).toBe("");
});
