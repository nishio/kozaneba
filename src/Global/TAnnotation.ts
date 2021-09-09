import { ItemId } from "./ItemId";

export type TAnnotation = TLineAnnot;

export type TLineAnnot = {
  type: "line";
  items: ItemId[];
  heads: TArrowHead[];
};

export type TArrowHead = "none" | "arrow";

export function isTAnnotation(x: any): x is TAnnotation {
  return (
    x.type === "line" &&
    Array.isArray(x.items) &&
    x.items.every((y: any) => typeof y === "string") &&
    Array.isArray(x.heads) &&
    x.heads.every((y: any) => y === "none" || y === "arrow")
  );
}
