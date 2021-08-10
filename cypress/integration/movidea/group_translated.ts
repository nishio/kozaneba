/// <reference types="cypress" />

import { piece_to_kozane } from "../../../src/utils/piece_to_kozane";

describe("group, tralslated", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    const json = {
      drawOrder: [1],
      itemStore: {
        1: {
          type: "group",
          id: 1,
          position: [50, 20],
          nameplate: null,
          isOpen: true,
          items: [2, 3],
          title: "",
        },
        2: {
          type: "piece",
          id: 2,
          position: [-100, 0],
          text: "A",
          compact: true,
          scale: 1,
        },
        3: {
          type: "piece",
          id: 3,
          position: [100, 0],
          text: "B",
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
    cy.get("div[data-testid='1']").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(104);
      expect(x[0].getBoundingClientRect().y).equal(189);
    });
    cy.get("div[data-testid='2']").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(134);
      expect(x[0].getBoundingClientRect().y).equal(219);
    });
  });
});
