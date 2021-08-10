/// <reference types="cypress" />

describe("tutorial", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("main", () => {
    cy.getGlobal((g) => g.dialog).should("eql", "Tutorial");
  });
});
