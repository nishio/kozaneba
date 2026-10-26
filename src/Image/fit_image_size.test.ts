import { describe, expect, it } from "vitest";
import { fit_image_size } from "./fit_image_size";

describe("fit_image_size", () => {
  it("keeps small images as they are", () => {
    expect(fit_image_size(2000, 1000)).toBe(null);
    expect(fit_image_size(10, 10)).toBe(null);
  });

  it("shrinks the longer side to the limit", () => {
    expect(fit_image_size(4000, 3000)).toEqual([2000, 1500]);
    expect(fit_image_size(1000, 5000)).toEqual([400, 2000]);
  });

  it("never returns a zero side", () => {
    expect(fit_image_size(10000, 1, 100)).toEqual([100, 1]);
  });
});
