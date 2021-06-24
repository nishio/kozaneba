import React from "react";
import { render, screen } from "@testing-library/react";
// import App from "./App";
import { adjustFontSize, AdjustFontSize } from "./AdjustFontSize";

test("AdjustFontSize", () => {
  render(<AdjustFontSize />);
  const x = screen.getByTestId("hidden-fusen") as HTMLDivElement;

  // expect(adjustFontSize("a", x)).toBe(1);
  // expect(adjustFontSize("あ", x)).toBe(128);
  // expect(adjustFontSize("ああ", x)).toBe(128);
  // expect(adjustFontSize("あああ", x)).toBe(128);
  // expect(adjustFontSize("あ".repeat(5), x)).toBe(128);
  // expect(adjustFontSize("あ".repeat(13), x)).toBe(128);
});
