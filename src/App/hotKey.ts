import { getGlobal } from "reactn";
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
    // const zoom = paper.project.view.zoom;
    // fitToContents();
    // if (zoom === paper.project.view.zoom) {
    //   // already fit to contests
    //   // zoom to mouse position
    //   const new_center = paper.view.viewToProject(new Point(lastX, lastY));
    //   console.log(lastX, lastY, new_center);
    //   updatePaperZoomCenter(new_center, 1.0);
    // }
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