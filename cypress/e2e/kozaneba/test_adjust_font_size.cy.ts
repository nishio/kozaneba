/// <reference types="cypress" />

import { TItemId } from "../../../src/Global/TItemId";
import { TKozaneItem } from "../../../src/Global/TKozaneItem";
import { TWorldCoord } from "../../../src/dimension/world_to_screen";

const id = (value: string) => value as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const kozane = (
  value: string,
  text: string,
  position: TWorldCoord
): TKozaneItem => ({
  type: "kozane",
  id: id(value),
  text,
  position,
  scale: 1,
});

describe("adjust font size", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(700, 700);
  });

  it("renders short and long kozane text with adjusted font size", () => {
    cy.updateGlobal((g) => {
      g.drawOrder = [id("short"), id("middle"), id("long")];
      g.itemStore = {
        short: kozane("short", ">あ", world(-200, -150)),
        middle: kozane("middle", ">" + "あ".repeat(13), world(0, 0)),
        long: kozane("long", ">" + "あ".repeat(2000), world(200, 150)),
      };
    });

    cy.get(".kozane").should("have.length", 3);
    cy.testid("short").should("have.css", "align-items", "center");
    cy.testid("short").then(($short) => {
      const shortFontSize = Number.parseFloat($short.css("font-size"));
      cy.testid("middle").then(($middle) => {
        const middleFontSize = Number.parseFloat($middle.css("font-size"));
        cy.testid("long").then(($long) => {
          const longFontSize = Number.parseFloat($long.css("font-size"));
          expect(shortFontSize).to.be.greaterThan(middleFontSize);
          expect(middleFontSize).to.be.greaterThan(longFontSize);
          expect(longFontSize).to.be.greaterThan(0);
        });
      });
    });
    cy.testid("middle").should(($middle) => {
      const fontSize = Number.parseFloat($middle.css("font-size"));
      expect(fontSize).to.be.greaterThan(10);
      expect(fontSize).to.be.lessThan(50);
    });
  });
});
