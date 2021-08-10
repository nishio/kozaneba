/// <reference types="cypress" />

import {
  KOZANE_OFFSET_X,
  KOZANE_OFFSET_Y,
} from "../../../src/Kozane/kozane_constants";
import { TGroupItem } from "../../../src/Group/GroupItem";
import { piece_to_kozane } from "../../../src/utils/piece_to_kozane";

describe("drag in/out", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.fixture("group_simple_json.json").then((json) => {
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
  });

  it("main", () => {
    cy.viewport(500, 500);
    cy.testid("2").should("hasPosition", [
      250 - 100 - KOZANE_OFFSET_X,
      250 - KOZANE_OFFSET_Y,
    ]);
    cy.testid("2").trigger("dragstart", "topLeft");
    cy.get("#canvas").trigger("drop", 85, 350);
    cy.testid("2").should("hasPosition", [85, 350]);

    const getItems = (g) => (g.itemStore["1"] as TGroupItem).items;
    cy.getGlobal(getItems).should("eql", [3]);

    cy.testid("2").trigger("dragstart", "topLeft");
    cy.get("#canvas").trigger("drop", 135, 350);
    cy.getGlobal(getItems).should("eql", [3]);
    cy.testid("2").should("hasPosition", [135, 350]);

    cy.testid("2").trigger("dragstart", "topLeft");
    cy.testid("1").trigger("drop", 0, 0);
    cy.getGlobal(getItems).should("eql", [3, 2]);

    cy.testid("2").trigger("dragstart", "topLeft");
    cy.get("#canvas").trigger("drop", 100, 100);
    cy.testid("3").trigger("dragstart", "topLeft");
    cy.get("#canvas").trigger("drop", 100, 100);

    cy.getGlobal((g) => g.drawOrder).should("eql", [1, 2, 3]);
    cy.getGlobal(getItems).should("eql", []);

    // select items
    cy.get("#canvas").trigger("mousedown", 90, 90);
    cy.get("#canvas").trigger("mouseup", 110, 110);

    // drag items into the group
    cy.get("#selection-view").trigger("dragstart");
    cy.testid("1").trigger("drop");

    cy.getGlobal(getItems).should("eql", [2, 3]);
  });
});
