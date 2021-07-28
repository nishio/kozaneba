/// <reference types="cypress" />

describe("add_fusen_dialog", () => {
  beforeEach(() => {
    cy.visit("/#blank");
  });

  it("main", () => {
    cy.testid("add-fusen-dialog").should("not.exist");
    cy.updateGlobal((g) => {
      g.dialog = "AddFusen";
    });
    cy.contains("Add Fusens").should("exist");
    cy.contains("Close").click();
    cy.testid("add-fusen-dialog").should("not.exist");
  });
  it("from menu", () => {
    cy.testid("main-menu").click();
    cy.contains("Add Fusens").click();
    cy.testid("textarea").type("a\nb\nc");
    cy.testid("add-fusen-button").click();
  });
});
