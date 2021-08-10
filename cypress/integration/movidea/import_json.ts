/// <reference types="cypress" />

import { piece_to_kozane } from "../../../src/utils/piece_to_kozane";

describe("import json", () => {
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
          scale: 1,
        },
      },
    };
    piece_to_kozane(json.itemStore);

    cy.window()
      .its("movidea")
      .then((movidea) => {
        setTimeout(() => {
          movidea.setGlobal({
            drawOrder: json.drawOrder,
            itemStore: json.itemStore,
          });
        });
      });
  });

  it("main", () => {
    cy.viewport(500, 500);
    cy.contains("ABC")
      .parent()
      .should("have.css", "top", "-51px")
      .should("have.css", "left", "-166px");
    cy.contains("DEF");
  });
});
