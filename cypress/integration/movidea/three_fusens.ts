/// <reference types="cypress" />

describe("import json", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    cy.fixture("three_fusens.json").then((json) => {
      cy.updateGlobal((g) => {
        g.itemStore = json.itemStore;
        g.drawOrder = json.drawOrder;
      });
    });
  });

  it("main", () => {});
});
