import { Menu, MenuItem } from "@mui/material";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { add_item } from "../API/add_item";
import { kozaneba } from "../API/KozanebaAPI";
import { UserMenuItem } from "../API/UserMenuItem";
import { get_center_of_screen } from "../dimension/get_center_of_screen";
import { get_item } from "../utils/get_item";
import { create_new_itemid } from "../utils/create_new_itemid";
import { BigMenuItem, SmallMenuItem } from "./BigSmallMenuItem";
import { close_context_menu } from "../utils/close_context_menu";
import { DeleteMenuItem } from "./DeleteMenuItem";
import { open_dialog } from "../utils/open_dialog";
import { VisitMenuItem } from "./VisitMenuItem";
import { updateGlobal } from "../Global/updateGlobal";
import { update_annotation_after_deletion } from "../utils/update_annotation_after_deletion";
import { get_scarpbox_links } from "../Kozane/parse_as_scrapbox";

export const KozaneMenu = () => {
  const [menu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Kozane";
  if (!open) return null;

  const g = getGlobal();
  const id = g.clicked_target;
  if (id === "" || g.itemStore[id] === undefined) return null;
  const item = get_item(g, id);
  if (item.type !== "kozane") return null;

  const onSplit = () => {
    open_dialog("SplitKozane");
  };
  const onEdit = () => {
    open_dialog("EditKozane");
  };
  const onClone = () => {
    const new_kozane = { ...get_item(g, id) };
    new_kozane.id = create_new_itemid();
    new_kozane.position = get_center_of_screen();
    add_item(new_kozane);
    close_context_menu();
  };
  const onLeaveFromLines = () => {
    updateGlobal((g) => {
      update_annotation_after_deletion(g, id);
    });
    close_context_menu();
  };

  const onExpandScrapboxLinks = () => {
    get_scarpbox_links(item);
  };
  const ExpandScrapboxLinks =
    g.scrapbox === "" ? null : (
      <MenuItem onClick={onExpandScrapboxLinks}>expand scrapbox links</MenuItem>
    );

  return (
    <Menu
      anchorEl={anchor}
      keepMounted
      open={open}
      onClose={close_context_menu}
    >
      <BigMenuItem id={id} />
      <SmallMenuItem id={id} />
      <MenuItem onClick={onSplit} data-testid="kozane-split">
        split
      </MenuItem>
      <MenuItem onClick={onEdit} data-testid="kozane-edit">
        edit
      </MenuItem>
      <MenuItem onClick={onClone} data-testid="kozane-clone">
        clone
      </MenuItem>
      <MenuItem onClick={onLeaveFromLines}>leave from lines</MenuItem>
      {ExpandScrapboxLinks}

      <VisitMenuItem url={item.custom?.url} />
      {kozaneba.user_menus["Kozane"]!.map(UserMenuItem)}
      <DeleteMenuItem id={id} />
    </Menu>
  );
};
