import { getGlobal, setGlobal } from "reactn";
import { get_items_bounding_box } from "../dimension/get_group_bounding_box";
import { ItemId } from "../Global/ItemId";

export const toggle_fit_to_contents = () => {
  const new_view = fit_to_contents(undefined, false);
  console.log("new_view:", new_view);
  const g = getGlobal();
  if (
    new_view.scale === g.scale &&
    new_view.trans_x === g.trans_x &&
    new_view.trans_y === g.trans_y
  ) {
    // if already fit to contents, recover previous view
    // console.log("recover previous view", prev_view);
    setGlobal(prev_view);
  } else {
    prev_view = { scale: g.scale, trans_x: g.trans_x, trans_y: g.trans_y };
    // console.log("new prev_view", prev_view);
    // console.log("fit to contents", new_view);
    setGlobal(new_view);
  }
};

const shrink = 0.9;
let prev_view = { scale: 1, trans_x: 0, trans_y: 0 };
export function fit_to_contents(items?: ItemId[], to_set = true) {
  const g = getGlobal();
  if (items === undefined) {
    items = g.drawOrder;
  }
  if (items.length === 0) return prev_view;
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
