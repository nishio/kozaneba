/// <reference types="cypress" />

describe("group, read simple JSON", () => {
  beforeEach(() => {
    cy.visit("/");
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
      expect(x[0].getBoundingClientRect().x).equal(30);
      expect(x[0].getBoundingClientRect().y).equal(150);
    });
    cy.get("div[data-testid='2']").should((x) => {
      window.a = x;
      expect(x[0].getBoundingClientRect().x).equal(80);
      expect(x[0].getBoundingClientRect().y).equal(200);
    });
  });
});
