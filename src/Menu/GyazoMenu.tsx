import { Menu } from "@mui/material";
import { getGlobal, useGlobal } from "../Global/ReactnCompat";
import { kozaneba } from "../API/KozanebaAPI";
import { UserMenuItem } from "../API/UserMenuItem";
import { TGyazoItem } from "../Global/TGyazoItem";
import { TItem } from "../Global/TItem";
import { close_context_menu } from "../utils/close_context_menu";
import { get_item } from "../utils/get_item";
import { AddLineMenuItem } from "./AddLineMenuItem";
import { BigMenuItem, SmallMenuItem } from "./BigSmallMenuItem";
import { DeleteMenuItem } from "./DeleteMenuItem";
import { VisitMenuItem } from "./VisitMenuItem";

const isTGyazoItem = (x: TItem): x is TGyazoItem => {
  return x.type === "gyazo";
};

export const GyazoMenu = () => {
  const [menu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Gyazo";
  if (!open) return null;

  const g = getGlobal();
  const id = g.clicked_target;
  if (id === "" || g.itemStore[id] === undefined) return null;
  const item = get_item(g, id);

  if (isTGyazoItem(item)) {
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
        <AddLineMenuItem id={id} />

        {kozaneba.user_menus["Gyazo"]!.map(UserMenuItem)}
        <DeleteMenuItem id={id} />
      </Menu>
    );
  }
  return null;
};
