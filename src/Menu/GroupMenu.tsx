import { Menu, MenuItem } from "@mui/material";
import React from "react";
import { getGlobal, useGlobal } from "../Global/ReactnCompat";
import { kozaneba } from "../API/KozanebaAPI";
import { UserMenuItem } from "../API/UserMenuItem";
import { mark_local_changed } from "../utils/mark_local_changed";
import { get_group } from "../utils/get_group";
import { updateGlobal } from "../Global/updateGlobal";
import { BigMenuItem, SmallMenuItem } from "./BigSmallMenuItem";
import { close_context_menu } from "../utils/close_context_menu";
import { delete_item_from_world } from "../utils/delete_item_from_world";
import { move_front } from "../utils/move_front";
import { normalize_group_position } from "../utils/normalize_group_position";
import { ungroup } from "./ungroup";
import { get_item } from "../utils/get_item";
import { update_annotation_after_deletion } from "../utils/update_annotation_after_deletion";
import { add_urls } from "../Scrapbox/add_scrapbox_links";
import { get_scarpbox_links } from "../Kozane/parse_as_scrapbox";
import { AddLineMenuItem } from "./AddLineMenuItem";
import { TWorldCoord } from "../dimension/world_to_screen";
import { redraw } from "../API/redraw";
import {
  faArrowsUpDownLeftRight,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const GroupMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Group";
  if (!open) return null;

  const g = getGlobal();
  const id = g.clicked_target;
  if (id === "" || g.itemStore[id] === undefined) return null;
  const group = get_group(g, id);

  const onUngroup = () => {
    ungroup(id);
  };

  const onDelete = () => {
    delete_item_from_world(id);
    updateGlobal((g) => {
      g.clicked_target = "";
    });
    mark_local_changed();
    setMenu("");
  };

  const isOpenGroup = group !== null && group.isOpen;
  const labelOpenClose = isOpenGroup ? "close" : "open";
  const onOpenClose = () => {
    normalize_group_position(id);
    move_front(id);
    updateGlobal((g) => {
      const group = get_group(g, id);
      group.isOpen = !isOpenGroup;
      group.scale = Math.max(
        group.scale,
        ...group.items.map((id) => get_item(g, id).scale)
      );
      g.menu = "";
    });
  };

  const onEditGroupTitle = () => {
    updateGlobal((g) => {
      g.dialog = "EditGroupTitle";
    });
  };

  const onLeaveFromLines = () => {
    updateGlobal((g) => {
      update_annotation_after_deletion(g, id);
    });
    close_context_menu();
  };

  const onExpandScrapboxLinks = () => {
    add_urls(
      group.items.flatMap((id) => {
        const item = get_item(g, id);
        if (item.type === "kozane") {
          return get_scarpbox_links(item);
        } else {
          return [];
        }
      })
    );
    close_context_menu();
  };
  const ExpandScrapboxLinks =
    g.scrapbox === "" ? null : (
      <MenuItem onClick={onExpandScrapboxLinks}>expand scrapbox links</MenuItem>
    );

  const onSpread = () => {
    updateGlobal((draft) => {
      group.items.forEach((id) => {
        const item = get_item(draft, id);
        const [x, y] = item.position;
        item.position = [2 * x, 2 * y] as TWorldCoord;
      });
    });
    close_context_menu();
    redraw();
  };

  const onRotate = () => {
    updateGlobal((draft) => {
      group.items.forEach((id) => {
        const item = get_item(draft, id);
        const [x, y] = item.position;
        item.position = [y, -x] as TWorldCoord;
      });
    });
    close_context_menu();
    redraw();
  };

  return (
    <Menu
      anchorEl={anchor}
      keepMounted
      open={open}
      onClose={close_context_menu}
      data-testid="group-menu"
    >
      <MenuItem onClick={onOpenClose} data-testid="group-open-close">
        {labelOpenClose}
      </MenuItem>
      {!isOpenGroup ? <BigMenuItem id={id} /> : null}
      {!isOpenGroup ? <SmallMenuItem id={id} /> : null}
      <MenuItem onClick={onUngroup} data-testid="group-ungroup">
        ungroup
      </MenuItem>
      <MenuItem onClick={onEditGroupTitle}>edit group title</MenuItem>
      <MenuItem onClick={onRotate}>
        <FontAwesomeIcon icon={faRotateLeft} />
        rotate
      </MenuItem>
      <MenuItem onClick={onSpread}>
        <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
        spread
      </MenuItem>

      <MenuItem onClick={onLeaveFromLines}>leave from lines</MenuItem>
      {ExpandScrapboxLinks}
      <AddLineMenuItem id={id} />

      {kozaneba.user_menus["Group"]!.map(UserMenuItem)}
      <MenuItem onClick={onDelete} data-testid="group-delete">
        delete
      </MenuItem>
    </Menu>
  );
};
