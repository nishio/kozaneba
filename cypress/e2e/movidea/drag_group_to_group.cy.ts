/// <reference types="cypress" />

// https://scrapbox.io/nishio/Cannot_add_property_0,_object_is_not_extensible
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

    cy.testid("3").trigger("dragstart", "topLeft");
    cy.testid("ba").trigger("drop", 600, 150);
    cy.testid("5").trigger("dragstart", "topLeft");
    cy.testid("ba").trigger("drop", 600, 250);

    cy.testid("ba").trigger("mousedown", 600, 100);
    cy.testid("ba").trigger("mouseup", 610, 300);
    cy.testid("selection-view").click();
    cy.testid("make-group").click();

    cy.testid("2").trigger("dragstart", "topLeft");
    cy.testid("6").trigger("drop", 0, 0);
  });
});
