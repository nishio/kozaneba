/// <reference types="cypress" />

describe("transform", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    const kozane = [
      {
        text: "+",
        x: 0,
        y: 0,
      },
      {
        text: "*",
        x: 250,
        y: 250,
      },
    ];

    cy.window()
      .its("movidea")
      .then((movidea) => {
        setTimeout(() => {
          movidea.setGlobal({ kozane });
        });
      });
  });

  it("position", () => {
    cy.viewport(500, 500);
    const yoffset = 12; // due to `items-align: center`
    cy.contains("+").should("hasPosition", [185, 200 + yoffset]);
    cy.contains("*").should("hasPosition", [435, 450 + yoffset]);

    const scale = 0.5;
    cy.setGlobal({ scale });
    cy.contains("+").should("hasPosition", [217.5, 225 + yoffset * scale]);
    cy.contains("*").should("hasPosition", [342.5, 350 + yoffset * scale]);
  });
});
