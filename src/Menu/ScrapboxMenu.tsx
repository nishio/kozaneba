import { Menu, MenuItem } from "@mui/material";
import { getGlobal, useGlobal } from "reactn";
import { kozaneba } from "../API/KozanebaAPI";
import { UserMenuItem } from "../API/UserMenuItem";
import { TItem } from "../Global/TItem";
import { TScrapboxItem } from "../Global/TScrapboxItem";
import { add_scrapbox_links } from "../Scrapbox/add_scrapbox_links";
import { close_context_menu } from "../utils/close_context_menu";
import { get_item } from "../utils/get_item";
import { AddLineMenuItem } from "./AddLineMenuItem";
import { BigMenuItem, SmallMenuItem } from "./BigSmallMenuItem";
import { DeleteMenuItem } from "./DeleteMenuItem";
import { TearMenuItem } from "./TearMenuItem";
import { VisitMenuItem } from "./VisitMenuItem";

const isTScrapboxItem = (x: TItem): x is TScrapboxItem => {
  return x.type === "scrapbox";
};

export const ScrapboxMenu = () => {
  const [menu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Scrapbox";
  if (!open) return null;

  const g = getGlobal();
  const id = g.clicked_target;
  if (id === "" || g.itemStore[id] === undefined) return null;
  const item = get_item(g, id);
  if (!isTScrapboxItem(item)) return null;

  const onExpand = () => {
    add_scrapbox_links(item.url, false, true);
  };

  return (
    <Menu
      anchorEl={anchor}
      keepMounted
      open={open}
      onClose={close_context_menu}
    >
      <BigMenuItem id={id} />
      <SmallMenuItem id={id} />
      <VisitMenuItem url={item.url} />
      <MenuItem onClick={onExpand}>expand</MenuItem>
      <TearMenuItem id={id} />
      <AddLineMenuItem id={id} />
      {kozaneba.user_menus["Scrapbox"]!.map(UserMenuItem)}
      <DeleteMenuItem id={id} />
    </Menu>
  );
};
