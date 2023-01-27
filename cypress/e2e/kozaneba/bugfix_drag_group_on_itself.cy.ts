/// <reference types="cypress" />

import { ready_one_group } from "../../support/e2e";

describe("ready one group with one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    ready_one_group();
  });

  it("bug reproduce", () => {
    cy.testid("ba").trigger("mousedown", 100, 100, { force: true });
    cy.testid("ba").trigger("mouseup", 101, 101, { force: true });
    cy.testid("G1").trigger("mousedown", 250, 250, { force: true });
    cy.testid("G1").trigger("mousemove", 251, 251, { force: true });
    cy.testid("G1").trigger("mouseup", 251, 251, { force: true });
    cy.getGlobal((g) => g.drawOrder.length).should("eq", 1);
  });
});
