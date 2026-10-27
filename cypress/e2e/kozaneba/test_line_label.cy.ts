/// <reference types="cypress" />

import { TWorldCoord } from "../../../src/dimension/world_to_screen";
import { TItemId } from "../../../src/Global/TItemId";
import {
  center_of,
  real_click_at,
  real_dblclick_at,
  real_drag,
  real_rightclick_at,
  TAppPoint,
} from "../../support/real_input";

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

const ready_two_kozanes_with_line = () => {
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

// The screen point on the middle of line 0 (between A and B). The real-input
// helpers press the mouse there, so the browser's own hit testing and pointer
// capture decide which element receives the events.
const on_line = (callback: (point: TAppPoint) => void) => {
  cy.testid("line-label-hit-0-0").then(($hit) => callback(center_of($hit)));
};

describe("line label", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    ready_two_kozanes_with_line();
  });

  it("edits and clears a line label inline with a real double click", () => {
    on_line(real_dblclick_at);
    cy.testid("line-label-editor-0").should("have.value", "");
    cy.testid("line-label-editor-0").type("supports{enter}");

    cy.contains("supports").should("exist");
    cy.getGlobal((g) => g.annotations[0]!.label).should("eql", "supports");
    cy.getGlobal((g) => g.is_local_change).should("eql", true);

    on_line(real_dblclick_at);
    cy.testid("line-label-editor-0").should("have.value", "supports");
    cy.testid("line-label-editor-0").clear().type("{enter}");

    cy.contains("supports").should("not.exist");
    cy.getGlobal((g) => g.annotations[0]!.label).should("be.undefined");
  });

  it("keeps the inline editor open when clicking inside it", () => {
    on_line(real_dblclick_at);
    cy.testid("line-label-editor-0").type("sup");
    cy.testid("line-label-editor-0").then(($input) => {
      real_click_at(center_of($input));
    });
    cy.testid("line-label-editor-0").should("have.value", "sup");
    cy.getGlobal((g) => g.annotations[0]!.label).should("be.undefined");
    cy.getGlobal((g) => g.mouseState).should("not.eql", "selecting");
  });

  it("edits a multi-line label in the dialog opened by a real right click", () => {
    on_line(real_rightclick_at);
    cy.testid("edit-annotation-dialog").should("be.visible");
    cy.get("[data-testid=edit-annotation-dialog] textarea")
      .first()
      .type("first{enter}second");

    cy.getGlobal((g) => g.annotations[0]!.label).should(
      "eql",
      "first\nsecond"
    );
    cy.getGlobal((g) => g.is_local_change).should("eql", true);

    cy.get("[data-testid=edit-annotation-dialog] textarea")
      .first()
      .clear();
    cy.getGlobal((g) => g.annotations[0]!.label).should("be.undefined");
  });

  it("does not start a selection when right clicking a line", () => {
    on_line(real_rightclick_at);
    cy.testid("edit-annotation-dialog").should("be.visible");
    cy.getGlobal((g) => g.mouseState).should("not.eql", "selecting");
  });

  it("still drags a kozane when pressed near where the line meets it", () => {
    // B is at world [100, 0]; the line meets B's left edge at world x = 35.
    // Press 4px inside B, on the line's axis, where the round cap of a 16px
    // hit line would reach.
    cy.testid("B").then(($b) => {
      const rect = $b[0]!.getBoundingClientRect();
      const y = rect.top + rect.height / 2;
      const from: TAppPoint = [rect.left + 4, y];
      real_drag(from, [from[0] + 40, from[1] + 30]);
    });
    cy.getGlobal((g) =>
      g.itemStore["B"]!.position.map((v: number) => Math.round(v))
    ).should("eql", [140, 30]);
  });

  it("still starts a selection rectangle on empty canvas", () => {
    // From the empty top-left corner over kozane A.
    cy.testid("A").then(($a) => {
      const rect = $a[0]!.getBoundingClientRect();
      real_drag([rect.left - 20, rect.top - 20], [rect.right + 10, rect.bottom + 10]);
    });
    cy.getGlobal((g) => g.selected_items).should("eql", ["A"]);
  });

  it("starts a selection rectangle when dragging from a line", () => {
    // From the middle of the line down past kozane B: B is selected, as when
    // the drag starts on empty canvas.
    on_line((p) => {
      cy.testid("B").then(($b) => {
        const rect = $b[0]!.getBoundingClientRect();
        real_drag(p, [rect.right + 10, rect.bottom + 10]);
      });
    });
    cy.getGlobal((g) => g.selected_items).should("eql", ["B"]);
  });

  it("does not open the editor while making a line", () => {
    cy.setGlobal({
      mouseState: "making_line",
      line_start: "A" as TItemId,
    });

    cy.testid("line-label-hit-0-0").should("not.exist");
  });
});

describe("line over a kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(800, 500);
    cy.movidea((m) => {
      m.make_one_kozane({
        id: "A" as TItemId,
        text: "A",
        position: [-250, 0] as TWorldCoord,
      });
      m.make_one_kozane({
        id: "B" as TItemId,
        text: "B",
        position: [250, 0] as TWorldCoord,
      });
      m.make_one_kozane({
        id: "C" as TItemId,
        text: "C",
        position: [0, 0] as TWorldCoord,
      });
    });
    cy.updateGlobal((g) => {
      g.annotations.push({
        type: "line",
        items: ["A", "B"] as TItemId[],
        heads: ["none", "none"],
        custom: {},
        is_doubled: false,
      });
    });
  });

  it("drags the kozane that a line passes over", () => {
    // The line A-B runs across the middle of C.
    cy.testid("C").then(($c) => {
      const p = center_of($c);
      real_drag(p, [p[0] + 40, p[1] + 30]);
    });
    cy.getGlobal((g) =>
      g.itemStore["C"]!.position.map((v: number) => Math.round(v))
    ).should("eql", [40, 30]);
  });

  it("still opens the label editor from the part of the line off the kozane", () => {
    cy.testid("A").then(($a) => {
      const a = $a[0]!.getBoundingClientRect();
      cy.testid("C").then(($c) => {
        const c = $c[0]!.getBoundingClientRect();
        real_dblclick_at([(a.right + c.left) / 2, c.top + c.height / 2]);
      });
    });
    cy.testid("line-label-editor-0").should("exist");
  });
});
