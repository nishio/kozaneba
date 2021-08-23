export const is_touchpad = (e: WheelEvent) => {
  // distinguish touchpad and mouse-wheel
  // tried https://stackoverflow.com/a/62415754/3651086
  // but it return false for MacBook touchpad event
  return true;
};
