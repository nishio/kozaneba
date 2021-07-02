/// <reference types="cypress" />

describe("scaled fusen", () => {
  beforeEach(() => {
    cy.visit("/");

    const json = {
      drawOrder: [2, 3],
      itemStore: {
        2: {
          type: "piece",
          id: 2,
          position: [-100, 0],
          text: "ABC",
          compact: true,
          scale: 1,
        },
        3: {
          type: "piece",
          id: 3,
          position: [100, 0],
          text: "DEF",
          compact: true,
          scale: 2,
        },
      },
    };

    cy.window()
      .its("movidea")
      .then((movidea) => {
        setTimeout(() => {
          movidea.setGlobal(json);
        });
      });
  });

  it("fusen sizes", () => {
    cy.contains("ABC").should("have.css", "width", "140px");
    cy.contains("DEF").should("have.css", "width", "280px");
  });
});
