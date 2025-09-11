import { MenuItem } from "@mui/material";
import React from "react";
import { close_context_menu } from "../utils/close_context_menu";
import { updateGlobal } from "../Global/updateGlobal";
import { TItemId } from "../Global/TItemId";
import { TLineType } from "../Global/initializeGlobalState";

type PropsType = { id: TItemId };
export const AddLineMenuItem = React.forwardRef<HTMLLIElement, PropsType>(
  ({ id }, ref) => {
    const onAddLine = (typ: TLineType) => {
      updateGlobal((g) => {
        g.mouseState = "making_line";
        g.line_start = id;
        g.line_type = typ;
      });
      close_context_menu();
    };

    return (
      <div
        style={{
          borderBottom: "solid 1px #eee",
        }}
      >
        <li
          style={{
            paddingLeft: "6px",
            paddingTop: "6px",
            borderTop: "solid 1px #eee",
            color: "#888",
          }}
        >
          One Line/Arrow
        </li>

        <div
          style={{
            display: "flex",
            padding: "6px 16px",
          }}
        >
          <MenuItem
            onClick={() => onAddLine("line")}
            dense={true}
            disableGutters={true}
          >
            <img
              src="/images/menu-icons/add-line.png"
              alt="add line"
            />
          </MenuItem>

          <MenuItem
            onClick={() => onAddLine("arrow")}
            dense={true}
            disableGutters={true}
          >
            <img
              src="/images/menu-icons/add-arrow.png"
              alt="add arrow"
            />
          </MenuItem>
          <MenuItem
            onClick={() => onAddLine("double_heads")}
            dense={true}
            disableGutters={true}
          >
            <img
              src="/images/menu-icons/add-bidirectional-arrow.png"
              alt="add bidirectional arrow"
            />
          </MenuItem>
          <MenuItem
            onClick={() => onAddLine("double_lines")}
            dense={true}
            disableGutters={true}
          >
            <img
              src="/images/menu-icons/add-double-lines.png"
              alt="add double lines"
            />
          </MenuItem>
        </div>
        <MenuItem onClick={() => onAddLine("delete")}>delete one line</MenuItem>
      </div>
    );
  }
);
