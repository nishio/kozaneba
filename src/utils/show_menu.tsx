import React from "react";
import styled from "styled-components";
import { TMenu } from "../Global/TMenu";
import { updateGlobal } from "../Global/updateGlobal";

export const show_menu = (menu: TMenu, event: React.MouseEvent) => {
  updateGlobal((g) => {
    if (g.menu === menu) {
      g.menu = "";
    } else {
      g.menu = menu;
      const a = document.getElementById("menu-anchor") as HTMLDivElement;
      a.style.left = event.clientX + "px";
      a.style.top = event.clientY + "px";
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
