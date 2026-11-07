import React from "react";
import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { show_menu } from "./show_menu";

const tap = (pointerType: string, x = 100, y = 100) =>
  ({ pointerId: 1, pointerType, clientX: x, clientY: y }) as unknown as React.PointerEvent<Element>;
const click_at = (x: number, y: number) =>
  document.getElementById("item")!.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, clientX: x, clientY: y })
  );

let onclick: ReturnType<typeof vi.fn<() => void>>;
beforeEach(() => {
  document.body.innerHTML = '<div id="menu-anchor"></div><button id="item"></button>';
  setGlobal({ ...INITIAL_GLOBAL_STATE } as State);
  onclick = vi.fn<() => void>();
  document.getElementById("item")!.addEventListener("click", onclick);
});

test("the click synthesized at the tap that opened a menu does not reach the menu", () => {
  show_menu("Group", tap("touch"));
  expect(getGlobal().menu).toBe("Group");
  click_at(101, 99); // Chromium's click for the same tap
  expect(onclick).not.toHaveBeenCalled();
  click_at(101, 99); // only that one
  expect(onclick).toHaveBeenCalledTimes(1);
});

test("a quick real tap on a menu item elsewhere goes through (iOS sends no ghost click)", () => {
  show_menu("Kozane", tap("touch"));
  click_at(140, 160);
  expect(onclick).toHaveBeenCalledTimes(1);
});

test("a click at the same point but later goes through", () => {
  vi.useFakeTimers();
  show_menu("Kozane", tap("touch"));
  vi.advanceTimersByTime(400);
  click_at(100, 100);
  vi.useRealTimers();
  expect(onclick).toHaveBeenCalledTimes(1);
});

test("a menu opened by the mouse lets clicks through", () => {
  show_menu("Kozane", tap("mouse"));
  click_at(100, 100);
  expect(onclick).toHaveBeenCalledTimes(1);
});
