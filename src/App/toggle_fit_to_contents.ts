import { getGlobal, setGlobal } from "../Global/ReactnCompat";
import { fit_to_contents } from "../utils/fit_to_contents";

let prev_view = { scale: 1, trans_x: 0, trans_y: 0 };

export const toggle_fit_to_contents = () => {
  const new_view = fit_to_contents(undefined, false) ?? prev_view;
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
