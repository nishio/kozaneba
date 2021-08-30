import { Menu } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { get_item } from "../Event/get_item";
import { TGyazoItem, TItem } from "../Global/initializeGlobalState";
import { BigSmallMenuItem } from "./BigSmallMenuItem";
import { DeleteMenuItem } from "./DeleteMenuItem";
import { VisitMenuItem } from "./VisitMenuItem";

const isTGyazoItem = (x: TItem): x is TGyazoItem => {
  return x.type === "gyazo";
};

export const GyazoMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Scrapbox";
  const onClose = () => {
    setMenu("");
  };
  const g = getGlobal();
  const id = g.clicked_target;
  if (id === "") return null;
  const item = get_item(g, id);
  if (isTGyazoItem(item)) {
    return (
      <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
        <BigSmallMenuItem id={id} />
        <VisitMenuItem item={item} />
        <DeleteMenuItem id={id} />
      </Menu>
    );
  }
  return null;
};
