import { ItemId } from "./initializeGlobalState";

export type TAnnotation = TLineAnnot;

export type TLineAnnot = {
  type: "line";
  items: ItemId[];
  heads: TArrowHead[];
};

export type TArrowHead = "none" | "arrow";
