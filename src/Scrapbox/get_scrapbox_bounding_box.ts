import { TScrapboxItem } from "../Global/TScrapboxItem";

export const SCRAPBOX_SIZE = 400;

export const get_scrapbox_bounding_box = (item: TScrapboxItem) => {
  const [x, y] = item.position;
  const scale = item.scale;
  const b = {
    top: y - (SCRAPBOX_SIZE / 2) * scale,
    left: x - (SCRAPBOX_SIZE / 2) * scale,
    bottom: y + (SCRAPBOX_SIZE / 2) * scale,
    right: x + (SCRAPBOX_SIZE / 2) * scale,
  };
  return b;
};
