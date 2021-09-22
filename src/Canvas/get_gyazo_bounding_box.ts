import { TGyazoItem } from "../Global/TGyazoItem";

export const base_size_cache: { [url: string]: [number, number] } = {};

export const get_gyazo_bounding_box = (item: TGyazoItem) => {
  const [x, y] = item.position;
  const scale = item.scale;
  if (!(item.url in base_size_cache)) {
    return { top: y, left: x, bottom: y, right: x };
  }
  const [w, h] = base_size_cache[item.url]!;
  const b = {
    top: y - (h / 2) * scale,
    left: x - (w / 2) * scale,
    bottom: y + (h / 2) * scale,
    right: x + (w / 2) * scale,
  };
  return b;
};
export const GYAZO_SIZE = 200;
export const GYAZO_BORDER = 1;
