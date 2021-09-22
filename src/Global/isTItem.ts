import { RTGroupItem } from "./TGroupItem";
import { isTGyazoItem } from "./TGyazoItem";
import { TItem } from "./TItem";
import { RTKozaneItem } from "./TKozaneItem";
import { RTScrapboxItem } from "./TScrapboxItem";

export function isTItem(x: any): x is TItem {
  return (
    RTKozaneItem.guard(x) ||
    RTGroupItem.guard(x) ||
    RTScrapboxItem.guard(x) ||
    isTGyazoItem(x)
  );
}
