import React from "react";
import { useGlobal } from "reactn";
import { HolderDiv } from "./HolderDiv";

export const SelectedItemsHolder: React.FC<{ top: number; left: number }> = ({
  top,
  left,
  children,
}) => {
  const [g] = useGlobal();

  const style = {
    top,
    left,
    transform: `scale(${g.scale}) translate(${g.trans_x}px, ${g.trans_y}px)`,
  };
  return <HolderDiv style={style}>{children}</HolderDiv>;
};
