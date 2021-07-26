import styled from "styled-components";
import { TITLE_HEIGHT, BORDER } from "../dimension/get_bounding_box";
import { OPACITY } from "../Fusen/fusen_constants";
import { GROUP_BORDER_COLOR } from "./group_constants";

export const GroupDiv = styled.div`
  border: ${BORDER}px solid ${GROUP_BORDER_COLOR};
  position: absolute;
`;
export const GroupBack = styled.div`
  background: #eee;
  width: 100%;
  height: 100%;
  opacity: ${OPACITY};
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
  padding-bottom: 1px;
`;
