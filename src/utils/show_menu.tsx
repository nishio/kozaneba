import React from "react";
import styled from "styled-components";
import { TMenu } from "../Global/TMenu";
import { updateGlobal } from "../Global/updateGlobal";
import { get_client_pos, TInputEvent } from "../Event/input_event";

export const show_menu = (menu: TMenu, event: TInputEvent<Element>) => {
  const [x, y] = get_client_pos(event);
  updateGlobal((g) => {
    if (g.menu === menu) {
      g.menu = "";
    } else {
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
