import { Menu } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { get_item } from "../Event/get_item";
import { TGyazoItem, TItem } from "../Global/initializeGlobalState";
import { BigSmallMenuItem } from "./BigSmallMenuItem";
import { close_context_menu } from "./close_context_menu";
import { DeleteMenuItem } from "./DeleteMenuItem";
import { VisitMenuItem } from "./VisitMenuItem";

const isTGyazoItem = (x: TItem): x is TGyazoItem => {
  return x.type === "gyazo";
};

export const GyazoMenu = () => {
  const [menu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Gyazo";

  const g = getGlobal();
  const id = g.clicked_target;
  if (id === "") return null;
  const item = get_item(g, id);
  if (isTGyazoItem(item)) {
    return (
      <Menu
        anchorEl={anchor}
        keepMounted
        open={open}
        onClose={close_context_menu}
      >
        <BigSmallMenuItem id={id} />
        <VisitMenuItem item={item} />
        <DeleteMenuItem id={id} />
      </Menu>
    );
  }
  return null;
};
