import React, { ReactNode } from "react";
import { useGlobal, useGlobalState } from "../Global/ReactnCompat";
import { HolderDiv } from "./HolderDiv";

export const SelectedItemsHolder: React.FC<{ top: number; left: number; children?: ReactNode }> = ({
  top,
  left,
  children,
}) => {
  // Get global state directly
  const g = useGlobalState();

  const style = {
    top,
    left,
    transform: `scale(${g.scale}) translate(${g.trans_x}px, ${g.trans_y}px)`,
  };
  return <HolderDiv style={style}>{children}</HolderDiv>;
};
