import { MenuItem } from "@material-ui/core";
import React from "react";
import { close_menu } from "../AppBar/close_menu";
import { mark_local_changed } from "../Cloud/mark_local_changed";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { delete_item_from_world } from "./delete_item_from_world";

export const DeleteMenuItem: React.FC<{ id: ItemId }> = ({ id }) => {
  const onDelete = () => {
    delete_item_from_world(id);
    updateGlobal((g) => {
      g.clicked_target = "";
    });
    mark_local_changed();
    close_menu();
  };

  return (
    <MenuItem onClick={onDelete} data-testid="delete">
      delete
    </MenuItem>
  );
};
