/// <reference types="cypress" />

import { do_click, ready_one_kozane } from "../../support/e2e";
import { TItemId } from "../../../src/Global/TItemId";
import { TGroupItem } from "../../../src/Global/TGroupItem";
import { TKozaneItem } from "../../../src/Global/TKozaneItem";
import { TWorldCoord } from "../../../src/dimension/world_to_screen";

const id = (value: string) => value as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const kozane = (
  value: string,
  position: TWorldCoord
): TKozaneItem => ({
  type: "kozane",
  id: id(value),
  position,
  text: value,
  scale: 1,
});

const readyGrid = () => {
  const itemStore: { [id: string]: TKozaneItem } = {};
  const drawOrder: TItemId[] = [];

  for (let x = -1; x < 2; x++) {
    for (let y = -1; y < 2; y++) {
      const value = `${x},${y}`;
      itemStore[value] = kozane(value, world(x * 200, y * 200));
      drawOrder.push(id(value));
    }
  }

  cy.updateGlobal((g) => {
    g.drawOrder = drawOrder;
    g.itemStore = itemStore;
  });
  cy.contains("0,0");
};

const selectRect = (
  left: number,
  top: number,
  right: number,
  bottom: number
) => {
  cy.testid("ba").trigger("mousedown", left, top);
  cy.testid("ba").trigger("mouseup", right, bottom);
};

const resetSelection = () => {
  cy.movidea((m) => {
    m.reset_selection();
  });
};

describe("selection", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
  });

  it("select one", () => {
    ready_one_kozane();
    cy.testid("ba").trigger("mousedown", 100, 100);
    cy.testid("ba").trigger("mousemove", 300, 300);
    cy.testid("ba").trigger("mouseup", 400, 400);
    cy.getGlobal((g) => g.selected_items).should("eql", ["1"]);
  });

  it("selects items by screen rectangle", () => {
    readyGrid();

    selectRect(150, 150, 250, 250);
    cy.getGlobal((g) => g.selected_items).should("eql", ["0,0"]);

    resetSelection();
    selectRect(150, 150, 450, 250);
    cy.getGlobal((g) => g.selected_items).should("eql", ["0,0", "1,0"]);

    resetSelection();
    selectRect(150, 150, 450, 450);
    cy.getGlobal((g) => g.selected_items).should("eql", [
      "0,0",
      "0,1",
      "1,0",
      "1,1",
    ]);
  });

  it("selects with an inverted screen rectangle", () => {
    readyGrid();

    selectRect(350, 350, 250, 250);
    cy.getGlobal((g) => g.selected_items).should("eql", ["0,0"]);
  });

  it("makes selected root items into a group", () => {
    cy.updateGlobal((g) => {
      g.drawOrder = [id("A"), id("B"), id("C")];
      g.itemStore = {
        A: kozane("A", world(0, 0)),
        B: kozane("B", world(-150, 0)),
        C: kozane("C", world(150, 0)),
      };
    });

    selectRect(75, 125, 425, 375);
    cy.getGlobal((g) => g.selected_items).should("eql", ["A", "B", "C"]);

    do_click("selection-view");
    cy.testid("make-group").click();

    cy.getGlobal((g) => {
      const root = g.itemStore[g.drawOrder[0]];
      return {
        drawOrderLength: g.drawOrder.length,
        rootType: root?.type,
        itemCount: (root as TGroupItem | undefined)?.items.length,
      };
    }).should("deep.equal", {
      drawOrderLength: 1,
      rootType: "group",
      itemCount: 3,
    });
  });
});
