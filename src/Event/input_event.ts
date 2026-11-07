import React from "react";
import { TScreenCoord } from "../dimension/world_to_screen";

export type TInputEvent<T extends Element = HTMLDivElement> =
  | React.MouseEvent<T>
  | React.DragEvent<T>
  | React.PointerEvent<T>
  | React.TouchEvent<T>;
export type TAnyInputEvent<T extends Element = HTMLDivElement> =
  | TInputEvent<T>
  | MouseEvent
  | PointerEvent
  | TouchEvent;

const COMPAT_MOUSE_EVENT_WINDOW_MS = 700;
let last_pointer_event_at = 0;

const is_pointer_event = (
  event: TAnyInputEvent<Element>
): event is React.PointerEvent<Element> | PointerEvent => {
  return "pointerId" in event;
};

export const should_ignore_compat_mouse_event = (
  event: TAnyInputEvent<Element>
): boolean => {
  if (is_pointer_event(event)) {
    last_pointer_event_at = Date.now();
    return false;
  }
  return Date.now() - last_pointer_event_at < COMPAT_MOUSE_EVENT_WINDOW_MS;
};

export const get_client_pos = (event: TAnyInputEvent<Element>): TScreenCoord => {
  if ("changedTouches" in event && event.changedTouches.length > 0) {
    const touch = event.changedTouches[0]!;
    return [touch.clientX, touch.clientY] as TScreenCoord;
  }
  if ("clientX" in event) {
    return [event.clientX, event.clientY] as TScreenCoord;
  }
  return [0, 0] as TScreenCoord;
};

export const get_button = (event: TAnyInputEvent<Element>): number => {
  if ("button" in event) {
    return event.button;
  }
  return 0;
};
