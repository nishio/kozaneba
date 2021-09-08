import { MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal } from "reactn";
import { close_menu } from "../utils/close_menu";
import { mark_local_changed } from "../utils/mark_local_changed";
import { get_item } from "../utils/get_item";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { move_front } from "../utils/move_front";

type PropsType = { id: ItemId };
export const BigMenuItem = React.forwardRef<HTMLLIElement, PropsType>(
  ({ id }, ref) => {
    const onBig = () => {
      updateGlobal((g) => {
        const item = get_item(g, id);
        item.scale++;
      });
      move_front(id);
      close_menu();
      mark_local_changed();
    };

    return (
      <MenuItem onClick={onBig} ref={ref} data-testid="big">
        big
      </MenuItem>
    );
  }
);

export const SmallMenuItem: React.FC<{ id: ItemId }> = ({ id }) => {
  const g = getGlobal();
  const target = get_item(g, id);
  const onSmall = () => {
    updateGlobal((g) => {
      const item = get_item(g, id);
      item.scale--;
    });
    move_front(id);
    close_menu();
    mark_local_changed();
  };
  const Small =
    target.scale > 1 ? (
      <MenuItem onClick={onSmall} data-testid="small">
        small
      </MenuItem>
    ) : null;

  return Small;
};
