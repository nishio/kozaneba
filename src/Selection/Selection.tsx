import React from "react";
import { useGlobal } from "reactn";
import { ids_to_dom } from "../Canvas/ids_to_dom";
import {
  onSelectionDragStart,
  onSelectionMouseDown,
} from "../Event/mouseEventMamager";
import { normalize_rect } from "../dimension/normalize_rect";
import { SelectedItemsHolder } from "./SelectedItemsHolder";
import { SelectionDiv } from "./SelectionDiv";
import { SelectionViewDiv } from "./SelectionViewDiv";
import { show_menu } from "../Menu/show_menu";

export const SelectionView: React.FC<{}> = ({ children }) => {
  const [selectionRange] = useGlobal("selectionRange");
  const [selected_items] = useGlobal("selected_items");
  const rect = normalize_rect(selectionRange);
  const top = document.body.clientHeight / 2 - rect.top;
  const left = document.body.clientWidth / 2 - rect.left;
  const offset = { x: 0, y: 0 };

  const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    show_menu("Selection", e);
  };
  return (
    <SelectionDiv
      style={rect}
      draggable
      onDragStart={onSelectionDragStart}
      onMouseDown={onSelectionMouseDown}
      onClick={onClick}
      id="selection-view"
    >
      <SelectedItemsHolder top={top} left={left}>
        {ids_to_dom(selected_items, offset)}
      </SelectedItemsHolder>
      <SelectionViewDiv />
    </SelectionDiv>
  );
};
