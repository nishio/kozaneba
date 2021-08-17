/// <reference types="cypress" />

import { TWorldCoord } from "../../../src/dimension/world_to_screen";
import { ItemId } from "../../../src/Global/initializeGlobalState";

export const ready_nested_group = () => {
  cy.movidea((m) => {
    m.make_one_kozane({
      id: "1" as ItemId,
      text: "1",
      position: [0, 0] as TWorldCoord,
    });
    m.make_items_into_new_group(["1"], { id: "G1", text: "G1" });
    m.make_items_into_new_group(["G1"], { id: "G2", text: "G2" });
  });
};

describe("ready nested groups", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    ready_nested_group();
  });
  it("do nothing", () => {});
  it("nested group", () => {
    // const offsetX = KOZANE_WIDTH / 2 + KOZANE_BORDER;
    // const offsetY = KOZANE_HEIGHT / 2 + KOZANE_BORDER;
    // const x = 250 - offsetX;
    // const y = 250 - offsetY;
    // cy.testid("C").should("hasPosition", [x, y]); // 185, 200
    // cy.testid("C").trigger("dragstart");
    // cy.testid("ba").trigger("drop", 250, 400);
    // cy.testid("C").should("hasPosition", [184, 349]); // 1px diff why?
    // cy.testid("C").trigger("dragstart");
    // cy.testid("A").trigger("drop", 50, 30);
    // cy.testid("B").trigger("dragstart");
    // cy.testid("ba").trigger("drop", 250, 400);
    // cy.testid("A").trigger("dragstart", "bottom");
    // cy.testid("B").trigger("drop", "center");
  });
});
