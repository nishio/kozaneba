import { Menu } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { get_item } from "../Event/get_item";
import { TItem, TScrapboxItem } from "../Global/initializeGlobalState";
import { BigSmallMenuItem } from "./BigSmallMenuItem";
import { DeleteMenuItem } from "./DeleteMenuItem";
import { VisitMenuItem } from "./VisitMenuItem";

const asTScrapboxItem = (x: TItem): TScrapboxItem => {
  if (x.type !== "scrapbox") {
    throw new Error(`expected TScrapboxItem, but ${x.type}`);
  }
  return x;
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
  const item = asTScrapboxItem(get_item(g, id));

  return (
    <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
      <BigSmallMenuItem id={id} />
      <VisitMenuItem item={item} />
      <DeleteMenuItem id={id} />
    </Menu>
  );
};
