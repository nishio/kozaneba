import { MenuItem } from "@mui/material";
import React from "react";
import { close_context_menu } from "../utils/close_context_menu";
import { updateGlobal } from "../Global/updateGlobal";
import { TItemId } from "../Global/TItemId";

type PropsType = { id: TItemId };
export const AddLineMenuItem = React.forwardRef<HTMLLIElement, PropsType>(
  ({ id }, ref) => {
    const onAddLine = () => {
      updateGlobal((g) => {
        g.mouseState = "making_line";
        g.line_start = id;
      });
      close_context_menu();
    };

    return (
      <MenuItem onClick={onAddLine} ref={ref} data-testid="add-line">
        add line
      </MenuItem>
    );
  }
);
