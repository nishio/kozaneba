/// <reference types="cypress" />

describe("add_fusen_dialog", () => {
  beforeEach(() => {
    cy.visit("/#blank");
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
