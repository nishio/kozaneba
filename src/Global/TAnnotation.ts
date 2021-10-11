import { Array, Boolean, Literal, Number, Record, Static } from "runtypes";
import { RTItemId } from "./TItemId";

export const RTArrowHead = Literal("none").Or(Literal("arrow"));
export type TArrowHead = Static<typeof RTArrowHead>;

export const RTLineAnnot = Record({
  type: Literal("line"),
  items: Array(RTItemId),
  heads: Array(RTArrowHead),
  is_doubled: Boolean,
  custom: Record({
    arrow_head_size: Number.optional(),
    is_clickable: Boolean.optional(),
    stroke_width: Number.optional(),
    opacity: Number.optional(),
  }),
});
export type TLineAnnot = Static<typeof RTLineAnnot>;

export const RTAnnotation = RTLineAnnot;
export type TAnnotation = TLineAnnot;
