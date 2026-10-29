import React from "react";
import styled from "styled-components";
import { TMenu } from "../Global/TMenu";
import { updateGlobal } from "../Global/updateGlobal";
import { get_client_pos, TInputEvent } from "../Event/input_event";

// A tap that opens a menu is followed by the click the browser synthesizes
// for that tap. Chromium hit-tests it after the menu has appeared under the
// finger, so it lands on a menu item: a tap on a group opened the group
// instead of showing its menu (found by replaying an iPad recording; iOS
// Safari does not do this). Swallow that one click.
const GHOST_CLICK_MS = 500;
let opened_by_touch_at = -Infinity;
let guard_installed = false;
const install_ghost_click_guard = () => {
  if (guard_installed) return;
  guard_installed = true;
  window.addEventListener(
    "click",
    (e) => {
      if (Date.now() - opened_by_touch_at < GHOST_CLICK_MS) {
        opened_by_touch_at = -Infinity;
        e.stopPropagation();
        e.preventDefault();
      }
    },
    true
  );
};

const is_touch_or_pen = (event: TInputEvent<Element>) =>
  "pointerType" in event &&
  (event.pointerType === "touch" || event.pointerType === "pen");

export const show_menu = (menu: TMenu, event: TInputEvent<Element>) => {
  const [x, y] = get_client_pos(event);
  updateGlobal((g) => {
    if (g.menu === menu) {
      g.menu = "";
    } else {
      if (is_touch_or_pen(event)) {
        install_ghost_click_guard();
        opened_by_touch_at = Date.now();
      }
      g.menu = menu;
      const a = document.getElementById("menu-anchor") as HTMLDivElement;
      a.style.left = x + "px";
      a.style.top = y + "px";
      g.menu_anchor = a;
    }
  });
};

export const MenuAnchor = () => {
  return <MenuAnchorDiv id="menu-anchor" />;
};
const MenuAnchorDiv = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0px;
  height: 0px;
  overflow: visible;
`;
