import { MenuItem } from "@mui/material";
import React from "react";
import { close_menu } from "../utils/close_menu";

export const VisitMenuItem: React.FC<{ url?: string }> = ({ url }) => {
  if (url === "" || url === undefined) {
    return null;
  }
  const onVisit = () => {
    window.open(url);
    close_menu();
  };
  return <MenuItem onClick={onVisit}>visit</MenuItem>;
};
