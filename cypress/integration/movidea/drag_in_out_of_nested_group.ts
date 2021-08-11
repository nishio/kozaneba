/// <reference types="cypress" />

import {
  KOZANE_BORDER,
  KOZANE_HEIGHT,
  KOZANE_WIDTH,
} from "../../../src/Kozane/kozane_constants";
import { piece_to_kozane } from "../../../src/utils/piece_to_kozane";

describe("drag in/out of nested group", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.fixture("nested_group.json").then((json) => {
      piece_to_kozane(json.itemStore);
      cy.updateGlobal((g) => {
        g.drawOrder = json.drawOrder;
        g.itemStore = json.itemStore;
      });
    });
  });

  it("main", () => {
    cy.viewport(500, 500);
    const offsetX = KOZANE_WIDTH / 2 + KOZANE_BORDER;
    const offsetY = KOZANE_HEIGHT / 2 + KOZANE_BORDER;
    const x = 250 - offsetX;
    const y = 250 - offsetY;
    cy.testid("C").should("hasPosition", [x, y]); // 185, 200

    cy.testid("C").trigger("dragstart");
    cy.testid("ba").trigger("drop", 250, 400);
    cy.testid("C").should("hasPosition", [184, 349]); // 1px diff why?

    cy.testid("C").trigger("dragstart");
    cy.testid("A").trigger("drop", 50, 30);

    cy.testid("B").trigger("dragstart");
    cy.testid("ba").trigger("drop", 250, 400);

    cy.testid("A").trigger("dragstart", "bottom");
    cy.testid("B").trigger("drop", "center");
  });
});
