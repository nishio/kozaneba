import styled from "styled-components";
import { NoSelect } from "../Group/GroupDiv";
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
  top: ${(props) => props.style?.top ?? "0px"};
  left: ${(props) => props.style?.left ?? "0px"};
  color: #000;
  word-wrap: break-word;
  overflow: hidden;
  font-size: 100px;
  text-align: center;
  display: flex;
  align-items: center;
  align-content: center;
  border: #aaa ${KOZANE_BORDER}px solid;
  position: absolute;
  line-height: 0.9;
  ${NoSelect};

  // background: linear-gradient(
  //   90deg,
  //   #d55,
  //   #dd5,
  //   #5d5,
  //   #5dd,
  //   #55d,
  //   #d5d,
  //   #d55,
  //   #dd5,
  //   #5d5
  // );
  // /* padding: 0.1em 0.2em; */
  // background-size: 400% 400%;
  // background-repeat: repeat;
  // animation: gaming 4s linear infinite, spin 2s infinite;
`;

export const KozaneDiv2 = styled.div`
  width: 100%;

  // mix-blend-mode: luminosity;
  // color: #f0f0f0;
`;
