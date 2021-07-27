/// <reference types="cypress" />

import {
  FUSEN_BORDER,
  FUSEN_HEIGHT,
  FUSEN_WIDTH,
} from "../../../src/Fusen/fusen_constants";

describe("drag in/out of nested group", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.fixture("nested_group.json").then((json) => {
      cy.updateGlobal((g) => {
        g.drawOrder = json.drawOrder;
        g.itemStore = json.itemStore;
      });
    });
  });

  it("main", () => {
    cy.viewport(500, 500);
    const offsetX = FUSEN_WIDTH / 2 + FUSEN_BORDER;
    const offsetY = FUSEN_HEIGHT / 2 + FUSEN_BORDER;
    const x = 250 - offsetX;
    const y = 250 - offsetY;
    cy.testid("C").should("hasPosition", [x, y]); // 185, 200

    cy.testid("C").trigger("dragstart");
    cy.testid("canvas").trigger("drop", 250, 400);
    cy.testid("C").should("hasPosition", [184, 349]); // 1px diff why?

    cy.testid("C").trigger("dragstart");
    cy.testid("A").trigger("drop", 50, 30);

    cy.testid("B").trigger("dragstart");
    cy.testid("canvas").trigger("drop", 250, 400);

    cy.testid("A").trigger("dragstart", "bottom");
    cy.testid("B").trigger("drop", "center");
  });
});
