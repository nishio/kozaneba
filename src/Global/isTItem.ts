import { isTKozaneItem } from "./TKozaneItem";
import { isTGroupItem } from "./TGroupItem";
import { isTGyazoItem } from "./TGyazoItem";
import { isTScrapboxItem } from "./TScrapboxItem";

export function isTItem(x: any): x is TItem {
  return (
    isTKozaneItem(x) || isTGroupItem(x) || isTScrapboxItem(x) || isTGyazoItem(x)
  );
}
