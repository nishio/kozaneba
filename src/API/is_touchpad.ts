export const is_touchpad = (e: WheelEvent) => {
  // distinguish touchpad and mouse-wheel
  
  const isTouchDevice = 'ontouchstart' in window || 
                       navigator.maxTouchPoints > 0 ||
                       navigator.userAgent.match(/iPad|iPhone|iPod|Android/i);
                       
  if (isTouchDevice) {
    return true;
  }
  
  const isDeltaSmall = Math.abs(e.deltaY) < 10;
  const hasDeltaX = e.deltaX !== 0;
  
  return isDeltaSmall || hasDeltaX;
};
