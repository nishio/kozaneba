import React from "react";
import { screen_to_world, TScreenCoord } from "../dimension/world_to_screen";
import { add_image_files, image_files_from } from "../Image/add_image_files";
import { is_some_dialog_open } from "../utils/is_some_dialog_open";

const has_files = (e: React.DragEvent) =>
  Array.from(e.dataTransfer.types).includes("Files");

export const onDragOver = (e: React.DragEvent) => {
  if (is_some_dialog_open()) return;
  if (!has_files(e)) return;
  // Without this the browser opens the dropped file instead.
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
};

export const onDrop = (e: React.DragEvent) => {
  if (is_some_dialog_open()) return;
  if (!has_files(e)) return;
  e.preventDefault();
  const files = image_files_from(e.dataTransfer);
  if (files.length === 0) return;
  const position = screen_to_world([e.clientX, e.clientY] as TScreenCoord);
  add_image_files(files, position);
};
