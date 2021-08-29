import { BORDER } from "../dimension/BORDER";
import { KOZANE_HEIGHT, KOZANE_WIDTH } from "../Kozane/kozane_constants";
import { TGroupItem } from "./GroupItem";
import { CLOSED_GROUP_BORDER_COLOR } from "./group_constants";
import { get_group_title } from "./Group";
import { constants } from "../API/constants";

export function calc_closed_style(
  value: TGroupItem,
  offset: { x: number; y: number }
) {
  const PADDING = constants.group_padding;
  const [x, y] = value.position;
  const scale = value.scale;
  const width = KOZANE_WIDTH * scale + PADDING * 2;
  const height = KOZANE_HEIGHT * scale + PADDING * 2;
  const top = offset.y + y - height / 2 - BORDER;
  const left = offset.x + x - width / 2 - BORDER;

  const custom = value.custom?.style ?? {};
  const style = {
    top,
    left,
    height,
    width,
    borderColor: CLOSED_GROUP_BORDER_COLOR,
    ...custom,
  };
  const new_offset = {
    x: width / 2,
    y: height / 2,
  };
  const text = get_group_title(value).replace("\n", " ");
  // need to keep "\n" for future edit, but need to be space for better rendering
  return { style, new_offset, text };
}
