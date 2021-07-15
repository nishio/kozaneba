import React from "react";
import { updateGlobal } from "./updateGlobal";
import { screen_to_world } from "./world_to_screen";

export const allowDrop = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
};
export const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
  // console.log(event);
  // const id = event.dataTransfer.getData("text");
  updateGlobal((g) => {
    const [dsx, dsy] = g.dragstart_position;

    // console.log(
    //   ex,
    //   g.trans_x,
    //   document.body.clientWidth,
    //   dsx,
    //   ex - g.trans_x - document.body.clientWidth / 2 - dsx
    // );
    const [x, y] = screen_to_world([event.clientX, event.clientY]);
    console.log("drop", [x, y], [dsx, dsy]);

    g.itemStore[g.drag_target].position = [
      // ex - g.trans_x - document.body.clientWidth / 2,
      // ey - g.trans_y - document.body.clientHeight / 2,
      x - dsx,
      y - dsy,
    ];
  });

  event.preventDefault();
};
