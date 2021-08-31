import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { kozaneba } from "../API/KozanebaAPI";
import { add_scrapbox_links } from "../API/make_scrapbox_kozane";
import { UserMenuItem } from "../API/UserMenuItem";
import { get_item } from "../Event/get_item";
import { TItem, TScrapboxItem } from "../Global/initializeGlobalState";
import { BigSmallMenuItem } from "./BigSmallMenuItem";
import { close_context_menu } from "./close_context_menu";
import { DeleteMenuItem } from "./DeleteMenuItem";
import { VisitMenuItem } from "./VisitMenuItem";

const isTScrapboxItem = (x: TItem): x is TScrapboxItem => {
  return x.type === "scrapbox";
};

export const ScrapboxMenu = () => {
  const [menu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Scrapbox";

  const g = getGlobal();
  const id = g.clicked_target;
  if (id === "") return null;
  const item = get_item(g, id);
  if (!isTScrapboxItem(item)) return null;

  const onExpand = () => {
    add_scrapbox_links(item.url, false, true);
  };
  if (isTScrapboxItem(item)) {
    return (
      <Menu
        anchorEl={anchor}
        keepMounted
        open={open}
        onClose={close_context_menu}
      >
        <BigSmallMenuItem id={id} />
        <VisitMenuItem item={item} />
        <MenuItem onClick={onExpand}>expand</MenuItem>

        {kozaneba.user_menus["Scrapbox"]!.map(UserMenuItem)}
        <DeleteMenuItem id={id} />
      </Menu>
    );
  }
  return null;
};
