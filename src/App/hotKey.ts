import { getGlobal } from "reactn";
import { get_items_bounding_box } from "../dimension/get_group_bounding_box";
import { updateGlobal } from "../Global/updateGlobal";

export const hotKey = (e: KeyboardEvent) => {
  const g = getGlobal();

  if (e.metaKey && e.key === "Enter") {
    finishDialog();
  }

  if (g.dialog !== "") {
    return;
  }
  const DX = document.body.clientWidth / 2;
  const DY = document.body.clientHeight / 2;
  if (e.key === "ArrowLeft" || e.key === "a") {
    moveCenter(-DX * moveDirection, 0);
    e.preventDefault();
  } else if (e.key === "ArrowRight" || e.key === "d") {
    moveCenter(DX * moveDirection, 0);
    e.preventDefault();
  } else if (e.key === "ArrowUp" || e.key === "w") {
    moveCenter(0, -DY * moveDirection);
    e.preventDefault();
  } else if (e.key === "ArrowDown" || e.key === "s") {
    moveCenter(0, DY * moveDirection);
    e.preventDefault();
  } else if (e.code === "Space") {
    fit_to_contents();
    e.preventDefault();
  } else {
    console.log(e);
  }
};
const moveCenter = (dx: number, dy: number) => {
  updateGlobal((g) => {
    g.trans_x += dx;
    g.trans_y += dy;
  });
};

export const finishButtons = {} as { [dialogName: string]: () => void };
const finishDialog = () => {
  Object.entries(finishButtons).forEach(([dialogName, onClick]) => {
    onClick();
  });
};
const moveDirection = 1;

const shrink = 0.9;
export function fit_to_contents() {
  const g = getGlobal();
  const b = get_items_bounding_box(g.drawOrder);

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

  updateGlobal((g) => {
    g.scale = scale;
    g.trans_x = -center_x;
    g.trans_y = -center_y;
  });
}
