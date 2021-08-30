import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { add_item } from "../API/add_item";
import { close_menu } from "../AppBar/close_menu";
import { get_center_of_screen } from "../Dialog/AddKozaneDialog/get_center_of_screen";
import { get_item } from "../Event/get_item";
import { create_new_itemid } from "../Kozane/create_new_itemid";
import { BigSmallMenuItem } from "./BigSmallMenuItem";
import { close_context_menu } from "./close_context_menu";
import { DeleteMenuItem } from "./DeleteMenuItem";
import { open_dialog } from "./open_dialog";

export const KozaneMenu = () => {
  const [menu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Kozane";

  const g = getGlobal();
  const id = g.clicked_target;
  if (id === "") return null;

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
    close_menu();
  };
  return (
    <Menu
      anchorEl={anchor}
      keepMounted
      open={open}
      onClose={close_context_menu}
    >
      <BigSmallMenuItem id={id} />
      <MenuItem onClick={onSplit} data-testid="kozane-split">
        split
      </MenuItem>
      <MenuItem onClick={onEdit} data-testid="kozane-edit">
        edit
      </MenuItem>
      <MenuItem onClick={onClone} data-testid="kozane-clone">
        clone
      </MenuItem>
      <DeleteMenuItem id={id} />
    </Menu>
  );
};
