/// <reference types="cypress" />

import { TGroupItem } from "../../../src/Global/TGroupItem";
import { TKozaneItem } from "../../../src/Global/TKozaneItem";
import { TItemId } from "../../../src/Global/TItemId";
import { TWorldCoord } from "../../../src/dimension/world_to_screen";

const id = (value: string) => value as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const kozane = (
  value: string,
  text: string,
  position: TWorldCoord,
  scale: number
): TKozaneItem => ({
  type: "kozane",
  id: id(value),
  text,
  position,
  scale,
});

const group = (
  value: string,
  position: TWorldCoord,
  items: string[]
): TGroupItem => ({
  type: "group",
  id: id(value),
  text: "",
  position,
  items: items.map(id),
  scale: 1,
  isOpen: true,
});

describe("kozane scale", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
  });

  it("renders scaled root kozane and redraws after a direct state update", () => {
    cy.updateGlobal((g) => {
      g.drawOrder = [id("2"), id("3")];
      g.itemStore = {
        "2": kozane("2", "ABC", world(-100, 0), 1),
        "3": kozane("3", "DEF", world(100, 0), 2),
      };
    });

    cy.testid("2").should("have.css", "width", "130px");
    cy.testid("3").should("have.css", "width", "260px");

    cy.updateGlobal((g) => {
      g.itemStore["3"]!.scale = 3;
    });
    cy.kozaneba((k) => {
      k.redraw();
    });

    cy.testid("3").should("have.css", "width", "390px");
  });

  it("renders scaled kozane inside a group", () => {
    cy.updateGlobal((g) => {
      g.drawOrder = [id("1")];
      g.itemStore = {
        "1": group("1", world(0, 0), ["2"]),
        "2": kozane("2", "ABC", world(0, 0), 2),
      };
    });

    cy.testid("2").should("have.css", "width", "260px");
  });
});
