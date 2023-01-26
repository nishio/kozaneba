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
              src="https://gyazo.com/53344a6db2cdf1c7ade0a2dd377c4793/thumb/50"
              alt="add line"
            />
          </MenuItem>

          <MenuItem
            onClick={() => onAddLine("arrow")}
            dense={true}
            disableGutters={true}
          >
            <img
              src="https://gyazo.com/53c370b43e1328439164baaed41be7a2/thumb/50"
              alt="add arrow"
            />
          </MenuItem>
          <MenuItem
            onClick={() => onAddLine("double_heads")}
            dense={true}
            disableGutters={true}
          >
            <img
              src="https://gyazo.com/c6611e172ffb5f19558aa796d31b4fe7/thumb/50"
              alt="add bidirectional arrow"
            />
          </MenuItem>
          <MenuItem
            onClick={() => onAddLine("double_lines")}
            dense={true}
            disableGutters={true}
          >
            <img
              src="https://gyazo.com/002bd9eca37cd538f35d369ed01b2659/thumb/50"
              alt="add double lines"
            />
          </MenuItem>
        </div>
        {/* <MenuItem onClick={() => onAddLine("delete")}>delete</MenuItem> */}
      </div>
    );
  }
);
