/// <reference types="cypress" />

import { piece_to_kozane } from "../../../src/utils/piece_to_kozane";

describe("scaled fusen group", () => {
  beforeEach(() => {
    cy.visit("/#blank");

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
          title: "",
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
    cy.contains("ABC").should("have.css", "width", "260px");
  });
});
