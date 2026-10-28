import { TAnnotation } from "../Global/TAnnotation";
import { TItemId } from "../Global/TItemId";
import {
  arrow_head_size_of,
  label_of,
  number_or,
  opacity_of,
  stroke_width_of,
} from "./annotation_values";

// a line as it may come out of a saved doc, with any field values
const line = (fields: Record<string, unknown>): TAnnotation =>
  ({
    type: "line",
    items: ["A", "B"] as TItemId[],
    heads: ["none", "none"],
    is_doubled: false,
    custom: {},
    ...fields,
  } as unknown as TAnnotation);

describe("number_or", () => {
  it("keeps finite numbers and reads numeric strings", () => {
    expect(number_or(3, 1)).toBe(3);
    expect(number_or(0, 1)).toBe(0);
    expect(number_or("0.5", 1)).toBe(0.5);
  });

  it("falls back for anything else", () => {
    expect(number_or(undefined, 1)).toBe(1);
    expect(number_or(null, 1)).toBe(1);
    expect(number_or("", 1)).toBe(1);
    expect(number_or("abc", 1)).toBe(1);
    expect(number_or(NaN, 1)).toBe(1);
    expect(number_or(Infinity, 1)).toBe(1);
    expect(number_or({}, 1)).toBe(1);
  });
});

describe("label_of", () => {
  it("returns string labels as they are", () => {
    expect(label_of(line({ label: "a\nb" }))).toBe("a\nb");
  });

  it("turns numbers and booleans into text", () => {
    expect(label_of(line({ label: 123 }))).toBe("123");
    expect(label_of(line({ label: false }))).toBe("false");
  });

  it("returns an empty label for missing or other values", () => {
    expect(label_of(line({}))).toBe("");
    expect(label_of(line({ label: null }))).toBe("");
    expect(label_of(line({ label: { text: "x" } }))).toBe("");
  });
});

describe("custom values", () => {
  it("reads numbers saved as strings", () => {
    const a = line({
      custom: { stroke_width: "3", opacity: "0.5", arrow_head_size: "20" },
    });
    expect(stroke_width_of(a)).toBe(3);
    expect(opacity_of(a)).toBe(0.5);
    expect(arrow_head_size_of(a)).toBe(20);
  });

  it("uses the defaults when custom is missing", () => {
    const a = line({ custom: undefined });
    expect(stroke_width_of(a)).toBe(1);
    expect(opacity_of(a)).toBe(0.2);
    expect(arrow_head_size_of(a)).toBe(10);
  });
});
