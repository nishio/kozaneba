import { Menu, MenuItem } from "@mui/material";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { kozaneba } from "../API/KozanebaAPI";
import { add_bipartite } from "../API/sample/add_bipartite";
import { UserMenuItem } from "../API/UserMenuItem";
import { reset_selection } from "../Selection/reset_selection";
import { add_arrow, THeadsOption } from "../utils/add_arrow";
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

  const onAddArrow = (heads_option: THeadsOption, is_doubled = false) => {
    add_arrow(getGlobal().selected_items, heads_option, is_doubled);
    reset_selection();
    mark_local_changed();
    setMenu("");
  };

  const onAddBipartite = (is_doubled = false) => {
    add_bipartite(getGlobal().selected_items, is_doubled);
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
        Add Line/Arrow
      </li>
      <div
        style={{
          display: "flex",
          padding: "6px 16px",
        }}
      >
        <MenuItem
          onClick={() => onAddArrow("none", false)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="https://gyazo.com/ed558892471712dc893b30bd257fa521/thumb/50"
            alt="add arrow(head:none)"
          />
        </MenuItem>

        <MenuItem
          onClick={() => onAddArrow("right", false)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="https://gyazo.com/75a5ad73d5d4b768de7bf1f3ea7864c2/thumb/50"
            alt="add arrow(head:right)"
          />
        </MenuItem>
        <MenuItem
          onClick={() => onAddArrow("all", false)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="https://gyazo.com/770e188862ebe1db8ceacb691a973eaf/thumb/50"
            alt="add arrow(head:all)"
          />
        </MenuItem>
        <MenuItem
          onClick={() => onAddBipartite(false)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="https://gyazo.com/f95bb0b29f554dc5cff8f50562c26e67/thumb/50"
            alt="add arrow(bipartite)"
          />
        </MenuItem>
      </div>
      <div
        style={{
          display: "flex",
          padding: "6px 16px",
          borderBottom: "solid 1px #eee",
        }}
      >
        <MenuItem
          onClick={() => onAddArrow("none", true)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="https://gyazo.com/f8112925940d458c77d37b53ad62974b/thumb/50"
            alt="add arrow(head:none, doubled)"
          />
        </MenuItem>

        <MenuItem
          onClick={() => onAddArrow("right", true)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="https://gyazo.com/b7969f22b5d5466c1b635bea836e1bf1/thumb/50"
            alt="add arrow(head:right, doubled)"
          />
        </MenuItem>
        <MenuItem
          onClick={() => onAddArrow("all", true)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="https://gyazo.com/e31fec4c894b227e7b13c230b9e046af/thumb/50"
            alt="add arrow(head:all, doubled)"
          />
        </MenuItem>
        <MenuItem
          onClick={() => onAddBipartite(true)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="https://gyazo.com/9d58339c0d47868f6f76f72885ff2783/thumb/50"
            alt="add arrow(bipartite, doubled)"
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
