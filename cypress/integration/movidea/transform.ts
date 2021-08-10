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
    cy.contains("+").should("hasPosition", [185, 200]);
    cy.contains("*").should("hasPosition", [435, 450]);

    cy.updateGlobal((g) => {
      g.scale = 0.5;
    });
    cy.contains("+").should("hasPosition", [217.5, 225]);
    cy.contains("*").should("hasPosition", [342.5, 350]);
  });
});
