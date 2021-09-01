import { BORDER, TITLE_HEIGHT } from "../dimension/BORDER";
import { get_group_bounding_box } from "../dimension/get_group_bounding_box";
import { to_rounded_px } from "../Kozane/to_rounded_px";
import { TGroupItem } from "./GroupItem";

export function calc_style(
  value: TGroupItem,
  offset: { x: number; y: number }
) {
  const b = get_group_bounding_box(value);
  const center_shift_x = b.left + b.right;
  const center_shift_y = b.top + b.bottom;

  const title = value.text ?? "";
  const title_height = title.length !== 0 ? TITLE_HEIGHT : 0;
  const width = b.right - b.left;
  const height = b.bottom - b.top;
  const relative_x = value.position[0];
  const relative_y = value.position[1];
  const top = to_rounded_px(offset.y + b.top - BORDER);
  const left = to_rounded_px(offset.x + b.left - BORDER);

  const custom = value.custom?.style ?? {};
  const style = { top, left, height, width, ...custom };
  const new_offset = {
    x: width / 2 - center_shift_x / 2 + relative_x,
    y: height / 2 - center_shift_y / 2 + relative_y,
  };
  return { style, title_height, title, new_offset };
}
