import React from "react";
import { updateGlobal } from "./updateGlobal";

export const allowDrop = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
};
export const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
  console.log(event);
  // const id = event.dataTransfer.getData("text");
  updateGlobal((g) => {
    const ex = event.pageX;
    const ey = event.pageY;
    const [dsx, dsy] = g.dragstart_position;
    console.log(
      ex,
      g.trans_x,
      document.body.clientWidth,
      dsx,
      ex - g.trans_x - document.body.clientWidth / 2 - dsx
    );
    g.itemStore[g.drag_target].position = [
      ex - g.trans_x - document.body.clientWidth / 2,
      ey - g.trans_y - document.body.clientHeight / 2,
    ];
  });

  event.preventDefault();
};
