import { Menu, MenuItem } from "@mui/material";
import React from "react";
import { getGlobal, useGlobal } from "reactn";
import { add_kozane } from "../API/add_kozane";
import { kozaneba } from "../API/KozanebaAPI";
import { add_bipartite } from "../API/sample/add_bipartite";
import { UserMenuItem } from "../API/UserMenuItem";
import { get_middle_point } from "../Canvas/Annotation/get_middle_point";
import { V2 } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { reset_selection } from "../Selection/reset_selection";
import {
  add_arrow_among_selected_items,
  THeadsOption,
} from "../utils/add_arrow";
import { create_new_itemid } from "../utils/create_new_itemid";
import { delete_item_from_world } from "../utils/delete_item_from_world";
import { get_item } from "../utils/get_item";
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
    add_arrow_among_selected_items(
      getGlobal().selected_items,
      heads_option,
      is_doubled
    );
    reset_selection();
    mark_local_changed();
    setMenu("");
  };

  const onAddBipartite = (is_doubled = false, is_arrow = true) => {
    add_bipartite(getGlobal().selected_items, is_doubled, is_arrow);
    reset_selection();
    mark_local_changed();
    setMenu("");
  };

  const onMerge = () => {
    const g = getGlobal();
    const texts = [] as string[];
    const positions = [] as TWorldCoord[][];
    const ids = [] as TItemId[];
    g.selected_items.forEach((id) => {
      const x = get_item(g, id);
      if (x.type === "kozane") {
        if (!texts.includes(x.text)) {
          texts.push(x.text);
          positions.push([x.position]);
        } else {
          const i = texts.indexOf(x.text);
          positions[i]!.push(x.position);
        }
        ids.push(id);
      }
    });
    if (texts.length === 0) {
      return; // nothing to merge
    }
    let merged_text = "";
    if (texts.length > 1) {
      const left_to_right = positions
        .map(get_middle_point)
        .map((v, i) => [v, i] as [V2, number])
        .sort((a, b) => a[0][0] - b[0][0]);
      merged_text = left_to_right.map((v) => texts[v[1]]).join("/");
    } else {
      // length === 1
      merged_text = texts[0]!;
    }
    {
      const id = create_new_itemid();
      const position = get_middle_point(
        positions.flatMap((x) => x)
      ) as TWorldCoord;
      add_kozane(merged_text, {
        position,
        id,
      });

      // potential heavy process, O(`num lines` x `num merged items`)
      const merged_item = id;
      updateGlobal((g) => {
        ids.forEach((id) => {
          g.annotations.forEach((a) => {
            if (a.type === "line") {
              if (a.items.includes(id)) {
                const i = a.items.indexOf(id);
                a.items[i] = merged_item;
              }
            }
          });
        });
      });

      // removed old items
      ids.forEach((id) => {
        delete_item_from_world(id);
      });
    }

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
          paddingLeft: "6px",
          paddingTop: "6px",
          borderTop: "solid 1px #eee",
          color: "#888",
        }}
      >
        Add Lines/Arrows
      </li>
      <div
        style={{
          display: "flex",
          padding: "6px 16px",
        }}
      >
        <MenuItem
          onClick={() => onAddBipartite(false, false)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="/images/menu-icons/add-lines-bipartite-single.png"
            alt="add lines(bipartite, single)"
          />
        </MenuItem>

        <MenuItem
          onClick={() => onAddArrow("none", false)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="/images/menu-icons/add-arrow-head-none.png"
            alt="add arrow(head:none)"
          />
        </MenuItem>

        <MenuItem
          onClick={() => onAddArrow("right", false)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="/images/menu-icons/add-arrow-head-right.png"
            alt="add arrow(head:right)"
          />
        </MenuItem>
        <MenuItem
          onClick={() => onAddArrow("all", false)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="/images/menu-icons/add-arrow-head-all.png"
            alt="add arrow(head:all)"
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
          onClick={() => onAddBipartite(false)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="/images/menu-icons/add-arrow-bipartite.png"
            alt="add arrow(bipartite)"
          />
        </MenuItem>
        <MenuItem
          onClick={() => onAddArrow("none", true)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="/images/menu-icons/add-arrow-head-none-doubled.png"
            alt="add arrow(head:none, doubled)"
          />
        </MenuItem>

        <MenuItem
          onClick={() => onAddArrow("all", true)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="/images/menu-icons/add-arrow-head-all-doubled.png"
            alt="add arrow(head:all, doubled)"
          />
        </MenuItem>
        <MenuItem
          onClick={() => onAddBipartite(true)}
          dense={true}
          disableGutters={true}
        >
          <img
            src="/images/menu-icons/add-arrow-bipartite-doubled.png"
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

      <MenuItem onClick={onMerge}>merge items</MenuItem>

      {kozaneba.user_menus["Selection"]!.map(UserMenuItem)}

      <MenuItem onClick={onDelete}>delete items</MenuItem>
    </Menu>
  );
};
