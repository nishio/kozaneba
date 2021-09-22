import { getGlobal, setGlobal } from "reactn";
import { get_items_bounding_box } from "../dimension/get_group_bounding_box";
import { TItemId } from "../Global/TItemId";

export function fit_to_contents(items?: TItemId[], to_set = true) {
  const g = getGlobal();
  if (items === undefined) {
    items = g.drawOrder;
  }
  if (items.length === 0) return null;
  const b = get_items_bounding_box(items);

  const viewWidth = document.body.clientWidth;
  const contentsWidth = b.right - b.left;
  let hscale = 1.0;
  if (viewWidth < contentsWidth) {
    hscale = viewWidth / contentsWidth;
  }
  const center_x = (b.right + b.left) / 2;

  let vscale = 1.0;
  const appBarHeight = document.getElementById("appbar")!.clientHeight;
  const viewHeight = document.body.clientHeight - appBarHeight;
  const contentsHeight = b.bottom - b.top;
  if (viewHeight < contentsHeight) {
    vscale = viewHeight / contentsHeight;
  }
  const scale = Math.min(hscale, vscale) * shrink;
  const center_y = (b.bottom + b.top) / 2 - appBarHeight / 2 / scale;
  const view = { scale, trans_x: -center_x, trans_y: -center_y };
  if (to_set) {
    setGlobal(view);
  }
  return view;
}
const shrink = 0.9;
