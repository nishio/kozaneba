import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { VisitMenuItem } from "./VisitMenuItem";

describe("VisitMenuItem", () => {
  test("is hidden for javascript: URLs", () => {
    const { container } = render(<VisitMenuItem url="javascript:alert(1)//.png" />);
    expect(container.innerHTML).toBe("");
  });
  test("opens http(s) URLs without opener", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<VisitMenuItem url="https://example.com/" />);
    fireEvent.click(screen.getByText("visit"));
    expect(open).toHaveBeenCalledWith("https://example.com/", "_blank", "noopener,noreferrer");
    open.mockRestore();
  });
});
