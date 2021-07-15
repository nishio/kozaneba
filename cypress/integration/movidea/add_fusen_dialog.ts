/// <reference types="cypress" />

describe("dialog", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("main", () => {
    cy.contains("Add Fusens").should("not.exist");
    cy.updateGlobal((g) => {
      g.dialog = "AddFusen";
    });
    cy.contains("Add Fusens").should("exist");
    cy.contains("Close").click();
    cy.contains("Add Fusens").should("not.exist");
  });
});
