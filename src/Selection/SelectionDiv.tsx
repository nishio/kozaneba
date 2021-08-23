import styled from "styled-components";
import { TRect } from "../dimension/TRect";
import { px } from "./px";

export const SelectionDiv = styled.div<{ rect: TRect }>`
  position: absolute;
  top: ${(props) => px(props.rect.top)};
  left: ${(props) => px(props.rect.left)};
  width: ${(props) => px(props.rect.width)};
  height: ${(props) => px(props.rect.height)};
`;
