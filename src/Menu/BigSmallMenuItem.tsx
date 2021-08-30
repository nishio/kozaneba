import { MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal } from "reactn";
import { close_menu } from "../AppBar/close_menu";
import { get_item } from "../Event/get_item";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";

export const BigSmallMenuItem: React.FC<{ id: ItemId }> = ({ id }) => {
  const g = getGlobal();
  const target = get_item(g, id);
  const onBig = () => {
    updateGlobal((g) => {
      const item = get_item(g, id);
      item.scale++;
    });
    close_menu();
  };
  const onSmall = () => {
    updateGlobal((g) => {
      const item = get_item(g, id);
      item.scale--;
    });
    close_menu();
  };
  const Small =
    target.scale > 1 ? (
      <MenuItem onClick={onSmall} data-testid="small">
        small
      </MenuItem>
    ) : null;

  return (
    <>
      <MenuItem onClick={onBig} data-testid="big">
        big
      </MenuItem>
      ;{Small}
    </>
  );
};
