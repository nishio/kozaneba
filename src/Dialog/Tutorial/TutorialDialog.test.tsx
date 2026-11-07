import React from "react";
import { render } from "@testing-library/react";
import { setGlobal } from "reactn";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../../Global/initializeGlobalState";
import { TutorialDialog } from "./TutorialDialog";
import { help_pages } from "./help_pages";
import { tutorial_pages } from "./tutorial_pages";

vi.mock("../../utils/close_menu", () => ({ close_menu_and_dialog: vi.fn() }));
// MainMenu pulls in Firebase Auth, which does not load under jsdom
vi.mock("../../AppBar/MainMenu/MainMenu", () => ({ in_readonly_mode: () => false }));

describe("TutorialDialog", () => {
  test("Help has more pages than Tutorial", () => {
    expect(help_pages.length).toBeGreaterThan(tutorial_pages.length);
  });

  test("does not crash on a page number past the tutorial", () => {
    setGlobal({
      ...INITIAL_GLOBAL_STATE,
      tutorial_page: help_pages.length - 1,
    });
    expect(() => render(<TutorialDialog />)).not.toThrow();
  });
});
