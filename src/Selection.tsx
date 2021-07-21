import { useGlobal } from "reactn";
import styled from "styled-components";
import { normalize_rect } from "./TRect";

const SelectionDiv = styled.div`
  position: absolute;
  background: rgba(0, 0, 255, 0.2);
`;

export const Selection = () => {
  const [selectionRange] = useGlobal("selectionRange");
  return <SelectionDiv style={normalize_rect(selectionRange)}></SelectionDiv>;
};
