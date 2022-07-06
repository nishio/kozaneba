import { MenuItem } from "@mui/material";
import React from "react";
import { getGlobal } from "reactn";
import { close_menu } from "../utils/close_menu";
import { mark_local_changed } from "../utils/mark_local_changed";
import { get_item } from "../utils/get_item";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { move_front } from "../utils/move_front";

type PropsType = { id: TItemId };
export const BigMenuItem = React.forwardRef<HTMLLIElement, PropsType>(
  ({ id }, ref) => {
    const g = getGlobal();
    const target = get_item(g, id);
    const onBig = () => {
      updateGlobal((g) => {
        const item = get_item(g, id);
        item.scale++;
      });
      move_front(id);
      close_menu();
      mark_local_changed();
    };

    const onDouble = () => {
      updateGlobal((g) => {
        const item = get_item(g, id);
        item.scale *= 2;
      });
      move_front(id);
      close_menu();
      mark_local_changed();
    };
    const Double =
      target.scale >= 2 ? (
        <MenuItem onClick={onDouble}>double size</MenuItem>
      ) : null;

    return (
      <>
        <MenuItem onClick={onBig} ref={ref} data-testid="big">
          big
        </MenuItem>
        {Double}
      </>
    );
  }
);

export const SmallMenuItem: React.FC<{ id: TItemId }> = ({ id }) => {
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
  const onHalf = () => {
    updateGlobal((g) => {
      const item = get_item(g, id);
      item.scale = Math.floor(item.scale / 2);
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

  const Half =
    target.scale >= 4 ? <MenuItem onClick={onHalf}>half</MenuItem> : null;

  return (
    <>
      {Small}
      {Half}
    </>
  );
};
