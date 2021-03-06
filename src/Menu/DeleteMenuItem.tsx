import { MenuItem } from "@mui/material";
import React from "react";
import { close_menu } from "../utils/close_menu";
import { mark_local_changed } from "../utils/mark_local_changed";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { delete_item_from_world } from "../utils/delete_item_from_world";

export const DeleteMenuItem: React.FC<{ id: TItemId }> = ({ id }) => {
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
