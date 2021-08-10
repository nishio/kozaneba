import styled from "styled-components";
import {
  KOZANE_WIDTH,
  KOZANE_HEIGHT,
  KOZANE_BORDER,
  OPACITY,
} from "./kozane_constants";

export const KozaneDiv = styled.div`
  background: #ffc;
  opacity: ${OPACITY};
  width: ${KOZANE_WIDTH}px;
  height: ${KOZANE_HEIGHT}px;
  color: #000;
  word-wrap: break-word;
  overflow: hidden;
  font-size: 100px;
  text-align: center;
  display: flex;ss
  align-items: center;
  align-content: center;
  border: #aaa ${KOZANE_BORDER}px solid;
  position: absolute;
  line-height: 0.9;
  user-select: none;
`;

export const KozaneDiv2 = styled.div`
  width: 100%;
`;
