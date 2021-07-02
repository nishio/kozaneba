/// <reference types="cypress" />

describe("scaled fusen group", () => {
  beforeEach(() => {
    cy.visit("/");

    const json = {
      drawOrder: [1],
      itemStore: {
        1: {
          type: "group",
          id: 1,
          position: [0, 0],
          nameplate: null,
          isOpen: true,
          items: [2],
        },
        2: {
          type: "piece",
          id: 2,
          position: [0, 0],
          text: "ABC",
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
    cy.contains("ABC").should("have.css", "width", "260px");
  });
});
