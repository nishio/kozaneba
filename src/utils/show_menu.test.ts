import React from "react";
import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { show_menu } from "./show_menu";

const tap = (pointerType: string) =>
  ({ pointerId: 1, pointerType, clientX: 10, clientY: 10 }) as unknown as React.PointerEvent<Element>;

beforeEach(() => {
  document.body.innerHTML = '<div id="menu-anchor"></div><button id="item"></button>';
  setGlobal({ ...INITIAL_GLOBAL_STATE } as State);
});

test("the click synthesized for the tap that opened a menu does not reach the menu", () => {
  const onclick = vi.fn();
  document.getElementById("item")!.addEventListener("click", onclick);
  show_menu("Group", tap("touch"));
  expect(getGlobal().menu).toBe("Group");
  document.getElementById("item")!.click(); // the ghost click
  expect(onclick).not.toHaveBeenCalled();
  document.getElementById("item")!.click(); // the person's next tap
  expect(onclick).toHaveBeenCalledTimes(1);
});

test("a menu opened by the mouse lets clicks through", () => {
  const onclick = vi.fn();
  document.getElementById("item")!.addEventListener("click", onclick);
  show_menu("Kozane", tap("mouse"));
  document.getElementById("item")!.click();
  expect(onclick).toHaveBeenCalledTimes(1);
});
