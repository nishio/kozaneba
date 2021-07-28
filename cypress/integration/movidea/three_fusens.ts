/// <reference types="cypress" />

import { ItemId } from "../../../src/Global/initializeGlobalState";

describe("import json", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    cy.fixture("three_fusens.json").then((json) => {
      cy.updateGlobal((g) => {
        g.itemStore = json.itemStore;
        g.drawOrder = json.drawOrder;
      });
    });
  });

  it("main", () => {
    cy.testid("canvas").trigger("mousedown", 100, 100);
    cy.testid("canvas").trigger("mouseup", 400, 400);
    cy.testid("selection-view").click();
    cy.contains("make group").click();

    cy.getGlobal((g) => g.drawOrder.slice(-1)[0]).then((id: ItemId) =>
      cy.testid(id).click()
    );
    cy.contains("ungroup").click();
  });
});
