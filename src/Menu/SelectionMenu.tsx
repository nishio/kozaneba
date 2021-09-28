import { Menu, MenuItem } from "@material-ui/core";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { kozaneba } from "../API/KozanebaAPI";
import { add_bipartite } from "../API/sample/add_bipartite";
import { UserMenuItem } from "../API/UserMenuItem";
import { reset_selection } from "../Selection/reset_selection";
import { add_arrow } from "../utils/add_arrow";
import { delete_item_from_world } from "../utils/delete_item_from_world";
import { make_items_into_new_group } from "../utils/make_items_into_new_group";
import { mark_local_changed } from "../utils/mark_local_changed";
import { copy_json } from "./copy_json";
import { copy_text } from "./copy_text";

export const SelectionMenu = () => {
  const [menu, setMenu] = useGlobal("menu");
  const [anchor] = useGlobal("menu_anchor");
  const open = menu === "Selection";
  const onClose = () => {
    setMenu("");
  };
  const onMakeGroup = () => {
    const g = getGlobal();
    make_items_into_new_group(g.selected_items, {});

    reset_selection();
    mark_local_changed();
    setMenu("");
  };

  const onDelete = () => {
    getGlobal().selected_items.forEach((id) => {
      delete_item_from_world(id);
    });
    reset_selection();
    mark_local_changed();
    setMenu("");
  };

  const onCopyText = () => {
    copy_text();
    setMenu("");
  };

  const onCopyJSON = () => {
    copy_json();
    setMenu("");
  };

  const onAddArrow = () => {
    add_arrow(getGlobal().selected_items);
    reset_selection();
    mark_local_changed();
    setMenu("");
  };
  const onAddArrowAllHeads = () => {
    add_arrow(getGlobal().selected_items, true);
    reset_selection();
    mark_local_changed();
    setMenu("");
  };
  const onAddBipartite = () => {
    add_bipartite(getGlobal().selected_items);
    reset_selection();
    mark_local_changed();
    setMenu("");
  };

  return (
    <Menu anchorEl={anchor} keepMounted open={open} onClose={onClose}>
      <MenuItem onClick={onMakeGroup} data-testid="make-group">
        make group
      </MenuItem>
      <MenuItem onClick={onCopyText} data-testid="copy-text">
        copy text
      </MenuItem>
      <MenuItem onClick={onCopyJSON} data-testid="copy-text">
        copy JSON
      </MenuItem>

      <li
        style={{
          paddingLeft: "16px",
          paddingTop: "6px",
          borderTop: "solid 1px #eee",
        }}
      >
        Add Arrow
      </li>
      <div
        style={{
          display: "flex",
          padding: "6px 16px",
          borderBottom: "solid 1px #eee",
        }}
      >
        <MenuItem onClick={onAddArrow} dense={true} disableGutters={true}>
          <img
            src="https://gyazo.com/75a5ad73d5d4b768de7bf1f3ea7864c2/thumb/50"
            alt="add arrow(head:left)"
          />
        </MenuItem>
        <MenuItem
          onClick={onAddArrowAllHeads}
          dense={true}
          disableGutters={true}
        >
          <img
            src="https://gyazo.com/770e188862ebe1db8ceacb691a973eaf/thumb/50"
            alt="add arrow(head:all)"
          />
        </MenuItem>
        <MenuItem onClick={onAddBipartite} dense={true} disableGutters={true}>
          <img
            src="https://gyazo.com/f95bb0b29f554dc5cff8f50562c26e67/thumb/50"
            alt="add arrow(bipartite)"
          />
        </MenuItem>
      </div>
      {/* <MenuItem onClick={onAddArrow} data-testid="copy-text">
        add arrow(head:left)
      </MenuItem>
      <MenuItem onClick={onAddArrowAllHeads} data-testid="copy-text">
        add arrow(head:all)
      </MenuItem> */}

      {kozaneba.user_menus["Selection"]!.map(UserMenuItem)}

      <MenuItem onClick={onDelete}>delete items</MenuItem>
    </Menu>
  );
};
