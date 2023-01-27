/// <reference types="cypress" />

import { piece_to_kozane } from "../../../src/utils/piece_to_kozane";

describe("scaled fusen", () => {
  beforeEach(() => {
    cy.visit("/#blank");

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
    piece_to_kozane(json.itemStore);

    cy.window()
      .its("movidea")
      .then((movidea) => {
        setTimeout(() => {
          movidea.setGlobal(json);
        });
      });
  });

  it("fusen sizes", () => {
    cy.contains("ABC").should("have.css", "width", "130px");
    cy.contains("DEF").should("have.css", "width", "260px");
    cy.window()
      .its("movidea")
      .then((movidea) => {
        movidea.updateGlobal((g) => {
          g.itemStore["3"].scale = 3;
        });
      });
    cy.contains("DEF").should("have.css", "width", "390px");
  });
});
