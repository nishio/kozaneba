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
  width: 100%;
  height: 100%;
`;

export const GroupTitle = styled.span`
  background: ${GROUP_TITLE_COLOR};
  position: absolute;
  font-size: 21px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: ${TITLE_HEIGHT}px;
  user-select: none;
`;
