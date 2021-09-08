import { MenuItem } from "@material-ui/core";
import React from "react";
import { close_menu } from "../utils/close_menu";
export type TUserMenu = {
  label: string;
  onClick: () => void;
  toShow?: () => boolean;
};
export const UserMenuItem: React.FC<TUserMenu> = ({
  label,
  onClick,
  toShow = () => true,
}) => {
  if (!toShow()) {
    return null;
  }
  return (
    <MenuItem
      onClick={() => {
        onClick();
        close_menu();
      }}
      key={label}
    >
      {label}
    </MenuItem>
  );
};
