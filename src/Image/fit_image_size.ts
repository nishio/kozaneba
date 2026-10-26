export const MAX_IMAGE_SIDE = 2000;

// Size to resize to so that the longer side is at most max_side.
// Returns null when the image is already small enough.
export const fit_image_size = (
  width: number,
  height: number,
  max_side = MAX_IMAGE_SIDE,
): [number, number] | null => {
  const longer = Math.max(width, height);
  if (longer <= max_side) return null;
  const scale = max_side / longer;
  return [
    Math.max(1, Math.round(width * scale)),
    Math.max(1, Math.round(height * scale)),
  ];
};
