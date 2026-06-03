/// <reference types="cypress" />

import { TItemId } from "../../../src/Global/TItemId";
import { TWorldCoord } from "../../../src/dimension/world_to_screen";
import { ready_one_kozane } from "../../support/e2e";

const pointer = {
  pointerId: 1,
  pointerType: "touch",
  isPrimary: true,
  button: 0,
  buttons: 1,
  force: true,
};

const pointerEnd = {
  ...pointer,
  buttons: 0,
};

describe("pointer events", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
  });

  it("drags a kozane with pointer events", () => {
    ready_one_kozane();

    cy.testid("1").trigger("pointerdown", "center", pointer);
    cy.testid("ba").trigger("pointermove", 240, 240, pointer);
    cy.testid("ba").trigger("pointerup", 230, 230, pointerEnd);

    cy.getGlobal((g) => g.itemStore["1"].position).should("eql", [-20, -20]);
  });

  it("selects a kozane with pointer events on the canvas", () => {
    ready_one_kozane();

    cy.testid("ba").trigger("pointerdown", 100, 100, pointer);
    cy.testid("ba").trigger("pointermove", 300, 300, pointer);
    cy.testid("ba").trigger("pointerup", 400, 400, pointerEnd);

    cy.getGlobal((g) => g.selected_items).should("eql", ["1"]);
  });

  it("drops a kozane into a group from a canvas pointerup", () => {
    cy.movidea((m) => {
      m.make_one_kozane({
        id: "1" as TItemId,
        text: "1",
        position: [-100, 0] as TWorldCoord,
      });
      m.make_one_kozane({
        id: "2" as TItemId,
        text: "2",
        position: [100, 0] as TWorldCoord,
      });
      m.make_items_into_new_group(["2" as TItemId], {
        id: "G2" as TItemId,
        text: "G2",
      });
    });

    cy.testid("G2").then(($group) => {
      const rect = $group[0]!.getBoundingClientRect();
      const dropX = rect.left + rect.width / 2;
      const dropY = rect.top + rect.height / 2;

      cy.testid("1").trigger("pointerdown", "center", pointer);
      cy.testid("ba").trigger("pointermove", dropX, dropY, pointer);
      cy.testid("ba").trigger("pointerup", dropX, dropY, pointerEnd);
    });

    cy.getGroup("G2", (g) => g.items).should("eql", ["2", "1"]);
  });
});
