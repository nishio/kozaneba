/// <reference types="cypress" />

import { KozaneItem } from "../../../src/Kozane/KozaneItem";
import { GroupItem } from "../../../src/Group/GroupItem";

describe("add_kozane_dialog", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
  });

  it("main", () => {
    cy.testid("add-kozane-dialog").should("not.exist");
    cy.updateGlobal((g) => {
      g.dialog = "AddKozane";
    });
    cy.contains("Add Kozane").should("exist");
    cy.testid("add-kozane-dialog").contains("Close").click();
    cy.testid("add-kozane-dialog").should("not.exist");
  });
  it("from menu", () => {
    cy.testid("main-menu").click();
    cy.contains("Add Kozane").click();
    cy.testid("textarea").type("a\nb\nc");
    cy.testid("add-kozane-button").click();

    // need to wait until updated
    cy.get(".kozane");
    cy.getGlobal((g) => {
      console.log(g);
      cy.wrap(g.drawOrder.length)
        .should("eql", 1)
        .then(() => {
          const group = g.itemStore[g.drawOrder[0]];
          cy.wrap(group?.type)
            .should("eql", "group")
            .then(() => {
              const first_item = g.itemStore[(group as GroupItem).items[0]];
              cy.wrap(first_item?.type).should("eql", "kozane");
              cy.wrap((first_item as KozaneItem).text).should("eql", "a");
            });
        });
    });
  });
});
