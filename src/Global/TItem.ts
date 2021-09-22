import { Static, Union } from "runtypes";
import { RTGroupItem } from "./TGroupItem";
import { RTGyazoItem } from "./TGyazoItem";
import { RTKozaneItem } from "./TKozaneItem";
import { RTScrapboxItem } from "./TScrapboxItem";

export const RTItem = Union(
  RTKozaneItem,
  RTGroupItem,
  RTScrapboxItem,
  RTGyazoItem
);
export type TItem = Static<typeof RTItem>;
