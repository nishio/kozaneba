import { Menu } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { get_item } from "../Event/get_item";
import { TItem, TScrapboxItem } from "../Global/initializeGlobalState";
import { BigSmallMenuItem } from "./BigSmallMenuItem";
import { DeleteMenuItem } from "./DeleteMenuItem";
import { VisitMenuItem } from "./VisitMenuItem";

const isTScrapboxItem = (x: TItem): x is TScrapboxItem => {
  return x.type === "scrapbox";
};

export const ScrapboxMenu = () => {
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
  if (isTScrapboxItem(item)) {
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