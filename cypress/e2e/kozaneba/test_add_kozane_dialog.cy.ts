/// <reference types="cypress" />

import { TGroupItem } from "../../../src/Global/TGroupItem";
import { TKozaneItem } from "../../../src/Global/TKozaneItem";

describe("add kozane dialog", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
  });

  it("opens and closes from state", () => {
    cy.testid("add-kozane-dialog").should("not.exist");

    cy.updateGlobal((g) => {
      g.dialog = "AddKozane";
    });

    cy.contains("Add Kozane").should("exist");
    cy.testid("add-kozane-dialog").contains("Close").click();
    cy.testid("add-kozane-dialog").should("not.exist");
  });

  it("creates a group from multiple lines", () => {
    cy.testid("main-menu").click();
    cy.contains("Add Kozane").click();
    cy.testid("textarea").type("a\nb\nc");
    cy.testid("add-kozane-button").click();

    cy.get(".kozane").should("exist");
    cy.getGlobal((g) => {
      const root = g.itemStore[g.drawOrder[0]];
      const firstItem =
        root?.type === "group"
          ? g.itemStore[(root as TGroupItem).items[0]]
          : undefined;

      return {
        rootCount: g.drawOrder.length,
        rootType: root?.type,
        firstType: firstItem?.type,
        firstText: (firstItem as TKozaneItem | undefined)?.text,
      };
    }).should("deep.equal", {
      rootCount: 1,
      rootType: "group",
      firstType: "kozane",
      firstText: "a",
    });
  });

  it("uses prefilled text", () => {
    cy.setGlobal({ add_kozane_text: "hello" });

    cy.testid("main-menu").click();
    cy.contains("Add Kozane").click();

    cy.testid("textarea").should("have.value", "hello");
  });
});
