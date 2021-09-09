import { isTGroupItem } from "./TGroupItem";
import { isTGyazoItem } from "./TGyazoItem";
import { TItem } from "./TItem";
import { isTKozaneItem } from "./TKozaneItem";
import { isTScrapboxItem } from "./TScrapboxItem";

export function isTItem(x: any): x is TItem {
  return (
    isTKozaneItem(x) || isTGroupItem(x) || isTScrapboxItem(x) || isTGyazoItem(x)
  );
}
