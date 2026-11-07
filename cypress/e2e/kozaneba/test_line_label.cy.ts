/// <reference types="cypress" />

import { TWorldCoord } from "../../../src/dimension/world_to_screen";
import { TItemId } from "../../../src/Global/TItemId";

type ScreenPoint = {
  clientX: number;
  clientY: number;
};

const center_of = ($element: JQuery<HTMLElement>): ScreenPoint => {
  const rect = $element[0]!.getBoundingClientRect();
  return {
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2,
  };
};

const drag_pointer = (
  $source: JQuery<HTMLElement>,
  target: ScreenPoint,
  pointerId: number
) => {
  const start = center_of($source);
  cy.wrap($source).trigger("pointerdown", {
    button: 0,
    buttons: 1,
    clientX: start.clientX,
    clientY: start.clientY,
    pointerId,
    pointerType: "mouse",
  });
  cy.wait(0);
  cy.testid("ba").trigger("pointermove", {
    buttons: 1,
    clientX: target.clientX,
    clientY: target.clientY,
    pointerId,
    pointerType: "mouse",
  });
  cy.wait(0);
  cy.testid("ba").trigger("pointerup", {
    button: 0,
    clientX: target.clientX,
    clientY: target.clientY,
    pointerId,
    pointerType: "mouse",
  });
};

const drag_anchor_to_kozane = (
  anchor_testid: string,
  target_testid: string,
  pointerId = 101
) => {
  cy.testid(anchor_testid).then(($anchor) => {
    cy.testid(target_testid).then(($target) => {
      drag_pointer($anchor as JQuery<HTMLElement>, center_of($target), pointerId);
    });
  });
};

const drag_anchor_to_point = (
  anchor_testid: string,
  target: ScreenPoint,
  pointerId = 102
) => {
  cy.testid(anchor_testid).then(($anchor) => {
    drag_pointer($anchor as JQuery<HTMLElement>, target, pointerId);
  });
};

const ready_two_kozanes = () => {
  cy.movidea((m) => {
    m.make_one_kozane({
      id: "A" as TItemId,
      text: "A",
      position: [-100, 0] as TWorldCoord,
    });
    m.make_one_kozane({
      id: "B" as TItemId,
      text: "B",
      position: [100, 0] as TWorldCoord,
    });
  });
};

const ready_three_kozanes = () => {
  cy.movidea((m) => {
    m.make_one_kozane({
      id: "A" as TItemId,
      text: "A",
      position: [-160, 0] as TWorldCoord,
    });
    m.make_one_kozane({
      id: "B" as TItemId,
      text: "B",
      position: [0, 0] as TWorldCoord,
    });
    m.make_one_kozane({
      id: "C" as TItemId,
      text: "C",
      position: [160, 0] as TWorldCoord,
    });
  });
};

const ready_two_kozanes_with_line = () => {
  ready_two_kozanes();
  cy.updateGlobal((g) => {
    g.annotations.push({
      type: "line",
      items: ["A", "B"] as TItemId[],
      heads: ["none", "none"],
      custom: {},
      is_doubled: false,
    });
  });
};

describe("blank ba", () => {
  it("does not block boot on external firebase ui css", () => {
    cy.request("/#blank")
      .its("body")
      .should("not.contain", "gstatic.com/firebasejs/ui")
      .and("contain", "boot-fallback")
      .and("contain", "/src/index.tsx");
  });

  it("renders the app chrome and canvas", () => {
    cy.visit("/#blank");
    cy.viewport(500, 500);

    cy.get("#appbar").should("be.visible").contains("Kozaneba");
    cy.testid("ba").should("exist");
    cy.get("#canvas").should("be.visible");
  });

  it("renders even when a saved onLoad user script throws", () => {
    cy.visit("/#blank", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "onLoad",
          "throw new Error('broken startup script')"
        );
      },
    });
    cy.viewport(500, 500);

    cy.get("#appbar").should("be.visible").contains("Kozaneba");
    cy.testid("ba").should("exist");
    cy.window().then((win) => {
      win.localStorage.removeItem("onLoad");
    });
  });
});

describe("line creation edit window", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
  });

  it("draws from hover anchor to another kozane and commits a label", () => {
    ready_two_kozanes();

    cy.testid("line-anchor-A-right").should("have.css", "opacity", "0.001");
    drag_anchor_to_kozane("line-anchor-A-right", "B");

    cy.testid("line-edit-window-0").should("be.visible");
    cy.testid("line-label-editor-0").should("have.value", "");
    cy.getGlobal((g) => g.annotations.length).should("eql", 1);
    cy.getGlobal((g) => g.line_edit_state?.annot_index).should("eql", 0);

    cy.testid("line-label-editor-0").type("supports{esc}");

    cy.getGlobal((g) => g.annotations[0]!.label).should("eql", "supports");
    cy.getGlobal((g) => g.line_edit_state).should("eql", null);
    cy.testid("line-label-text-0").click();
    cy.testid("line-label-editor-0").should("have.value", "supports");
    cy.testid("line-label-editor-0").clear().type("relates{enter}");

    cy.getGlobal((g) => g.annotations[0]!.label).should("eql", "relates");
    cy.contains("relates").should("exist");
  });

  it("does not create a line when anchor drag releases in empty space", () => {
    ready_two_kozanes();

    drag_anchor_to_point("line-anchor-A-left", { clientX: 20, clientY: 20 });

    cy.getGlobal((g) => g.annotations.length).should("eql", 0);
    cy.getGlobal((g) => g.line_edit_state).should("eql", null);
    cy.testid("line-edit-window-0").should("not.exist");
  });

  it("keeps kozane body drag as movement, not line creation", () => {
    ready_two_kozanes();

    cy.testid("A").then(($a) => {
      drag_pointer($a as JQuery<HTMLElement>, { clientX: 130, clientY: 280 }, 103);
    });

    cy.getGlobal((g) => g.annotations.length).should("eql", 0);
    cy.getGlobal((g) => g.itemStore["A"]!.position).should("not.eql", [
      -100,
      0,
    ]);
  });

  it("edits type, retargets an endpoint, and deletes from the edit window", () => {
    ready_three_kozanes();
    drag_anchor_to_kozane("line-anchor-A-right", "B", 104);

    cy.testid("line-style-arrow-0").click();
    cy.getGlobal((g) => g.annotations[0]!.heads).should("eql", [
      "none",
      "arrow",
    ]);
    cy.getGlobal((g) => g.line_edit_state?.annot_index).should("eql", 0);

    cy.testid("line-endpoint-hit-0-1").then(($handle) => {
      cy.testid("C").then(($target) => {
        drag_pointer($handle as JQuery<HTMLElement>, center_of($target), 105);
      });
    });

    cy.getGlobal((g) => g.annotations[0]!.items).should("eql", ["A", "C"]);
    cy.getGlobal((g) => g.line_edit_state?.annot_index).should("eql", 0);

    cy.testid("line-delete-0").click();
    cy.getGlobal((g) => g.annotations.length).should("eql", 0);
    cy.getGlobal((g) => g.line_edit_state).should("eql", null);
  });

  it("opens a label-less passive line from the midpoint affordance", () => {
    ready_two_kozanes_with_line();

    cy.testid("line-midpoint-hit-0").click();
    cy.testid("line-label-editor-0").type("because{enter}");

    cy.getGlobal((g) => g.annotations[0]!.label).should("eql", "because");
    cy.testid("line-label-text-0").should("be.visible");
  });
});
