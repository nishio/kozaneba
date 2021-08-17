import styled from "styled-components";
import { TITLE_HEIGHT, BORDER } from "../dimension/get_bounding_box";
import {
  GROUP_BACKGROUND_COLOR,
  GROUP_BORDER_COLOR,
  GROUP_TITLE_COLOR,
} from "./group_constants";

export const GroupDiv = styled.div`
  border: ${BORDER}px solid ${GROUP_BORDER_COLOR};
  position: absolute;
  border-radius: 5px;
`;

export const GroupBack = styled.div`
  position: absolute;
  background: ${GROUP_BACKGROUND_COLOR};
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  top: -1px;
  left: -1px;
`;

export const GroupTitle = styled.span`
  background: ${GROUP_TITLE_COLOR};
  position: absolute;
  font-size: 21px;
  width: calc(100% + 2px);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: ${TITLE_HEIGHT + 1}px;
  user-select: none;
  top: -1px;
  left: -1px;
`;
