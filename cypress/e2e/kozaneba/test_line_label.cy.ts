/// <reference types="cypress" />

import { TWorldCoord } from "../../../src/dimension/world_to_screen";
import { TItemId } from "../../../src/Global/TItemId";

describe("blank ba", () => {
  it("does not block boot on external firebase ui css", () => {
    cy.request("/#blank")
      .its("body")
      .should("not.contain", "gstatic.com/firebasejs/ui")
      .and("contain", "boot-fallback")
      .and("contain", "/static/js/bundle.js");
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

describe("line label", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    ready_two_kozanes_with_line();
  });

  it("edits and clears a line label inline", () => {
    cy.testid("line-label-hit-0-0").dblclick({ force: true });
    cy.testid("line-label-editor-0").should("have.value", "");
    cy.testid("line-label-editor-0").type("supports{enter}");

    cy.contains("supports").should("exist");
    cy.getGlobal((g) => g.annotations[0]!.label).should("eql", "supports");
    cy.getGlobal((g) => g.is_local_change).should("eql", true);

    cy.testid("line-label-hit-0-0").dblclick({ force: true });
    cy.testid("line-label-editor-0").should("have.value", "supports");
    cy.testid("line-label-editor-0").clear().type("{enter}");

    cy.contains("supports").should("not.exist");
    cy.getGlobal((g) => g.annotations[0]!.label).should("be.undefined");
  });

  it("does not open the editor while making a line", () => {
    cy.setGlobal({
      mouseState: "making_line",
      line_start: "A" as TItemId,
    });

    cy.testid("line-label-hit-0-0").should("not.exist");
  });
});
