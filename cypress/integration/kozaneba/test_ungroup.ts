/// <reference types="cypress" />

import { ready_nested_group } from "../../support";

describe("test ungroup", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
  });
  it("nested", () => {
    ready_nested_group();
    cy.testid("G1").click("topLeft", { force: true });
    cy.testid("group-ungroup").click();
  });
});
