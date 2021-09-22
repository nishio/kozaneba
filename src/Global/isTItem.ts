import { isTGroupItem } from "./TGroupItem";
import { isTGyazoItem } from "./TGyazoItem";
import { TItem } from "./TItem";
import { RTKozaneItem } from "./TKozaneItem";
import { isTScrapboxItem } from "./TScrapboxItem";

export function isTItem(x: any): x is TItem {
  return (
    RTKozaneItem.guard(x) ||
    isTGroupItem(x) ||
    isTScrapboxItem(x) ||
    isTGyazoItem(x)
  );
}
