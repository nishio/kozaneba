import { getGlobal } from "reactn";
import { zoom_around_pointer } from "../Event/onWheel";
import { constants } from "../API/constants";
import { toggle_fit_to_contents } from "./toggle_fit_to_contents";
import { moveCenter } from "../utils/moveCenter";
import { open_dialog } from "../utils/open_dialog";

export const hotKey = (e: KeyboardEvent) => {
  const g = getGlobal();
  if (g.disableHotKey) return;

  if (e.metaKey && e.key === "Enter") {
    finishDialog();
  }

  if (g.dialog !== "") {
    return;
  }
  if (g.menu !== "") {
    return;
  }

  const DX = document.body.clientWidth / 2;
  const DY = document.body.clientHeight / 2;
  const moveDirection = constants.arrow_key_movement;
  if (e.key === "ArrowLeft" || e.key === "a") {
    moveCenter(DX * moveDirection, 0);
    e.preventDefault();
  } else if (e.key === "ArrowRight" || e.key === "d") {
    moveCenter(-DX * moveDirection, 0);
    e.preventDefault();
  } else if (e.key === "ArrowUp" || e.key === "w") {
    moveCenter(0, DY * moveDirection);
    e.preventDefault();
  } else if (e.key === "ArrowDown" || e.key === "s") {
    moveCenter(0, -DY * moveDirection);
    e.preventDefault();
  } else if (e.code === "Space") {
    toggle_fit_to_contents();
    e.preventDefault();
  } else if (e.code === "Enter") {
    open_dialog("AddKozane");
    e.preventDefault();
  } else if (e.key === "b") {
    zoom_in_pointer();
    e.preventDefault();
  } else if (e.key === "n") {
    zoom_out_pointer();
    e.preventDefault();
  } else {
    console.log(e);
  }
};
export const finishButtons = {} as { [dialogName: string]: () => void };
const finishDialog = () => {
  Object.entries(finishButtons).forEach(([dialogName, onClick]) => {
    onClick();
  });
};

const zoom_in_pointer = () => {
  zoom_around_pointer(2);
};

const zoom_out_pointer = () => {
  zoom_around_pointer(0.5);
};
