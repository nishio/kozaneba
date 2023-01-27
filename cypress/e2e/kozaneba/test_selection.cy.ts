/// <reference types="cypress" />

import { ready_one_kozane } from "../../support/e2e";

describe("selection", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
  });

  it("select one", () => {
    ready_one_kozane();
    cy.testid("ba").trigger("mousedown", 100, 100);
    cy.testid("ba").trigger("mousemove", 300, 300);
    cy.testid("ba").trigger("mouseup", 400, 400);
    cy.getGlobal((g) => g.selected_items).should("eql", ["1"]);
  });
});
