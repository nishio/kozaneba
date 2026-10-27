import { MenuItem } from "@mui/material";
import React from "react";
import { close_menu } from "../utils/close_menu";
import { is_http_url } from "../utils/is_http_url";

export const VisitMenuItem: React.FC<{ url?: string }> = ({ url }) => {
  if (!is_http_url(url)) {
    return null;
  }
  const onVisit = () => {
    window.open(url, "_blank", "noopener,noreferrer");
    close_menu();
  };
  return <MenuItem onClick={onVisit}>visit</MenuItem>;
};
