/// <reference types="cypress" />

import { TGroupItem } from "../../../src/Global/TGroupItem";
import {
  KOZANE_OFFSET_X,
  KOZANE_OFFSET_Y,
} from "../../../src/utils/kozane_constants";
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
    cy.testid("ba").trigger("drop", 85, 350);
    cy.testid("2").should("hasPosition", [85, 350]);

    const getItems = (g) => (g.itemStore["1"] as TGroupItem).items;
    cy.getGlobal(getItems).should("eql", [3]);

    cy.testid("2").trigger("dragstart", "topLeft");
    cy.testid("ba").trigger("drop", 135, 350);
    cy.getGlobal(getItems).should("eql", [3]);
    cy.testid("2").should("hasPosition", [135, 350]);

    cy.testid("2").trigger("dragstart", "topLeft");
    cy.testid("1").trigger("drop", 0, 0);
    cy.getGlobal(getItems).should("eql", [3, 2]);

    cy.testid("2").trigger("dragstart", "topLeft");
    cy.testid("ba").trigger("drop", 100, 100);
    cy.testid("3").trigger("dragstart", "topLeft");
    cy.testid("ba").trigger("drop", 100, 100);

    cy.getGlobal((g) => g.drawOrder).should("eql", [1, 2, 3]);
    cy.getGlobal(getItems).should("eql", []);

    // select items
    cy.testid("ba").trigger("mousedown", 90, 90);
    cy.testid("ba").trigger("mouseup", 110, 110);

    // drag items into the group
    cy.get("#selection-view").trigger("dragstart");
    cy.testid("1").trigger("drop");

    cy.getGlobal(getItems).should("eql", [2, 3]);

    cy.testid("2").trigger("dragstart", "topLeft", { force: true });
    cy.testid("ba").trigger("drop", 100, 100);
    cy.setGlobal({ fix_timestamp_for_test: 10 });
    cy.movidea((m) => {
      m.make_items_into_new_group([2]);
    });
    cy.setGlobal({ fix_timestamp_for_test: null });
    cy.getGlobal((g) => g.drawOrder).should("eql", [1, "10"]);
  });
});
