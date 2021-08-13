/// <reference types="cypress" />

describe("drag group to group", () => {
  beforeEach(() => {
    cy.visit("/#blank");
  });

  it("main", () => {
    cy.viewport(800, 500);
    cy.setGlobal({ fix_timestamp_for_test: 0 });

    cy.testid("main-menu").click();
    cy.contains("Add Kozane").click();
    cy.testid("textarea").type("2\n3\n4\n5");
    cy.testid("add-kozane-button").click();

    cy.testid("1").click();
    cy.testid("group-open-close").click();
    cy.testid("group-menu").click("topLeft"); // close menu

    cy.testid("1").trigger("dragstart");
    cy.testid("ba").trigger("drop", 100, 100);

    cy.testid("1").click();
    cy.testid("group-ungroup").click();
    cy.testid("ba").trigger("mousedown", 400, 400);
    cy.testid("ba").trigger("mouseup", 90, 90);
    cy.testid("selection-view").click();
    cy.testid("make-group").click();

    cy.testid("6").click();
    cy.testid("group-open-close").click();
    cy.getGlobal((g) => g.itemStore["6"].position).should("eql", [-300, -150]);
  });
});
