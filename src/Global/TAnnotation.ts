import { TItemId } from "./TItemId";

export type TAnnotation = TLineAnnot;

export type TLineAnnot = {
  type: "line";
  items: TItemId[];
  heads: TArrowHead[];
  custom?: {
    arrow_head_size?: number;
    is_clickable?: boolean;
    stroke_width?: number;
    opacity?: number;
  };
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
