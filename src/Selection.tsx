import React from "react";
import { useGlobal } from "reactn";
import styled from "styled-components";
import { idsToDom } from "./idsToDom";
import { ignoreEvent } from "./mouseEventMamager";
import { normalize_rect } from "./TRect";

const SelectionDiv = styled.div`
  position: absolute;
`;

const SelectionViewDiv = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 255, 0.2);
  z-index: 2;
`;

export const HolderDiv = styled.div`
  position: absolute;
  width: 0px;
  height: 0px;
  overflow: visible;
  z-index: -1;
`;

export const SelectionView: React.FC<{}> = ({ children }) => {
  const [selectionRange] = useGlobal("selectionRange");
  const [selected_items] = useGlobal("selected_items");
  const rect = normalize_rect(selectionRange);
  const top = document.body.clientHeight / 2 - rect.top;
  const left = document.body.clientWidth / 2 - rect.left;
  const offset = { x: 0, y: 0 };

  return (
    <SelectionDiv style={rect} draggable onMouseDown={ignoreEvent}>
      <SelectedItemsHolder top={top} left={left}>
        {idsToDom(selected_items, offset)}
      </SelectedItemsHolder>
      <SelectionViewDiv />
    </SelectionDiv>
  );
};

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
  return (
    <HolderDiv style={style} id="selected_items_holder">
      {children}
    </HolderDiv>
  );
};
