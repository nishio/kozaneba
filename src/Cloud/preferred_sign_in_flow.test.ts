import { sign_in_flow_for } from "./preferred_sign_in_flow";

describe("sign_in_flow_for", () => {
  test("desktop (fine pointer, no touch) uses popup", () => {
    expect(sign_in_flow_for({ coarsePointer: false, hasTouch: false })).toBe(
      "popup"
    );
  });
  test("coarse pointer (finger) uses redirect", () => {
    expect(sign_in_flow_for({ coarsePointer: true, hasTouch: false })).toBe(
      "redirect"
    );
  });
  test("touch device uses redirect", () => {
    expect(sign_in_flow_for({ coarsePointer: false, hasTouch: true })).toBe(
      "redirect"
    );
  });
});
