import React from "react";
import { useGlobal } from "reactn";
import { ids_to_dom } from "../Canvas/ids_to_dom";
import { onSelectionMouseDown } from "../Event/mouseEventMamager";
import { normalize_rect } from "../dimension/normalize_rect";
import { SelectedItemsHolder } from "./SelectedItemsHolder";
import { SelectionDiv } from "./SelectionDiv";
import { SelectionViewDiv } from "./SelectionViewDiv";

export const SelectionView: React.FC = React.memo(() => {
  const [selectionRange] = useGlobal("selectionRange");
  const [selected_items] = useGlobal("selected_items");
  const rect = normalize_rect(selectionRange);
  const top = document.body.clientHeight / 2 - rect.top;
  const left = document.body.clientWidth / 2 - rect.left;
  const offset = { x: 0, y: 0 };

  return (
    <SelectionDiv
      rect={rect}
      onMouseDown={onSelectionMouseDown}
      id="selection-view"
      data-testid="selection-view"
    >
      <SelectedItemsHolder top={top} left={left}>
        {ids_to_dom(selected_items, offset)}
      </SelectedItemsHolder>
      <SelectionViewDiv />
    </SelectionDiv>
  );
});
