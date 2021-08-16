import styled from "styled-components";
import { TITLE_HEIGHT, BORDER } from "../dimension/get_bounding_box";
import { GROUP_BACKGROUND_COLOR, GROUP_BORDER_COLOR } from "./group_constants";

export const GroupDiv = styled.div`
  border: ${BORDER}px solid ${GROUP_BORDER_COLOR};
  position: absolute;
`;

export const GroupBack = styled.div`
  position: absolute;
  background: ${GROUP_BACKGROUND_COLOR};
  width: 100%;
  height: 100%;
`;

export const GroupTitle = styled.span`
  background: ${GROUP_BORDER_COLOR};
  position: absolute;
  font-size: 21px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: ${TITLE_HEIGHT}px;
  margin: -1px -1px -1px 0;
  padding-bottom: 1px;
`;
