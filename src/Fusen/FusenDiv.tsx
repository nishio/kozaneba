import styled from "styled-components";
import {
  FUSEN_WIDTH,
  FUSEN_HEIGHT,
  FUSEN_BORDER,
  OPACITY,
} from "./fusen_constants";

export const FusenDiv = styled.div`
  background: #ffc;
  opacity: ${OPACITY};
  width: ${FUSEN_WIDTH}px;
  height: ${FUSEN_HEIGHT}px;
  color: #000;
  word-wrap: break-word;
  overflow: hidden;
  font-size: 100px;
  text-align: center;
  display: flex;
  align-items: center;
  align-content: center;
  border: #aaa ${FUSEN_BORDER}px solid;
  position: absolute;
  line-height: 0.9;
  user-select: none;
`;

export const FusenDiv2 = styled.div`
  width: 100%;
`;
