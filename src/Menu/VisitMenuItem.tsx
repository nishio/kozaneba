import { MenuItem } from "@material-ui/core";
import React from "react";
import { close_menu } from "../AppBar/close_menu";

export const VisitMenuItem: React.FC<{ item: { url: string } }> = ({
  item,
}) => {
  if (item.url === "") {
    return null;
  }
  const onVisit = () => {
    window.open(item.url);
    close_menu();
  };
  return <MenuItem onClick={onVisit}>visit</MenuItem>;
};
