/// <reference types="cypress" />

describe("group, read simple JSON", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.fixture("group_simple_json.json").then((json) => {
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

  it("position", () => {
    cy.viewport(500, 500);
    cy.get("div[data-testid='1']").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(55);
      expect(x[0].getBoundingClientRect().y).equal(170);
    });
    cy.get("div[data-testid='2']").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(85);
      expect(x[0].getBoundingClientRect().y).equal(200);
    });
  });
});
