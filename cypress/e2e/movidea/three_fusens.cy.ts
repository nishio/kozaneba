/// <reference types="cypress" />

import { ItemId } from "../../../src/Global/initializeGlobalState";
import { piece_to_kozane } from "../../../src/utils/piece_to_kozane";

describe("three fusens", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    cy.fixture("three_fusens.json").then((json) => {
      piece_to_kozane(json.itemStore);
      cy.updateGlobal((g) => {
        g.itemStore = json.itemStore;
        g.drawOrder = json.drawOrder;
      });
    });
  });

  it("main", () => {
    cy.testid("ba").trigger("mousedown", 100, 100);
    cy.testid("ba").trigger("mouseup", 400, 400);
    cy.testid("selection-view").click("topRight");
    cy.contains("make group").click();

    cy.getGlobal((g) => g.drawOrder.slice(-1)[0]).then((id: ItemId) =>
      cy.testid(id).click()
    );
    cy.contains("ungroup").click();
  });
});
