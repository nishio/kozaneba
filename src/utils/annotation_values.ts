import { TAnnotation } from "../Global/TAnnotation";

// A saved doc is not checked against RTLineAnnot when it is loaded, so a
// field can arrive with the wrong type (e.g. a label written as a number by a
// user script or another tool). Read these fields through the functions below
// so that one bad value does not crash the render of the whole ba.

// A finite number, a string of one, or `fallback`.
export const number_or = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
};

export const label_of = (a: TAnnotation): string => {
  const value: unknown = a.label;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};

export const stroke_width_of = (a: TAnnotation): number =>
  number_or(a.custom?.stroke_width, 1);

export const opacity_of = (a: TAnnotation): number =>
  number_or(a.custom?.opacity, 0.2);

export const arrow_head_size_of = (a: TAnnotation): number =>
  number_or(a.custom?.arrow_head_size, 10);
