/// <reference types="cypress" />

describe("visit_reset", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("main", () => {
    cy.visit("/");
    cy.window().its("x").should("eql", undefined);
    cy.window().then(window => {window.x = 1})
    cy.window().its("x").should("eql", 1);

    cy.visit("/");
    cy.window().its("x").should("eql", undefined); // (A)
    cy.window().then(window => {window.x = 2})
    cy.window().its("x").should("eql", 2);

    cy.visit("/#blank");
    cy.window().its("x").should("eql", 2);  // (B)

    cy.visit("/");
    cy.window().its("x").should("eql", undefined);  // (C)
  });
});