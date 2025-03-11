import { MenuItem } from "@mui/material";
import React from "react";
import { setGlobal, useGlobal } from "../../Global/ReactnCompat";

export const StartTutorial = () => {
  const [in_tutorial] = useGlobal("in_tutorial");
  if (!in_tutorial) {
    const onTutorial = () => {
      setGlobal({ in_tutorial: true });
    };
    return <MenuItem onClick={onTutorial}>Start Tutorial</MenuItem>;
  }
  return null;
};
