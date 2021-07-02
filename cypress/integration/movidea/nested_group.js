/// <reference types="cypress" />

describe("group", () => {
  beforeEach(() => {
    cy.visit("/");
    const json = {
      drawOrder: [1],
      itemStore: {
        1: {
          type: "group",
          id: 1,
          position: [0, 0],
          nameplate: null,
          isOpen: true,
          items: [2],
        },
        2: {
          type: "group",
          id: 2,
          position: [0, 0],
          nameplate: null,
          isOpen: true,
          items: [3],
        },
        3: {
          type: "piece",
          id: 3,
          position: [0, 0],
          text: "A",
          compact: true,
          scale: 1,
        },
      },
    };

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

  it("position", () => {
    cy.viewport(500, 500);
    cy.get("div[data-testid='1']").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(80);
      expect(x[0].getBoundingClientRect().y).equal(100);
    });
    cy.get("div[data-testid='3']").should((x) => {
      window.a = x;
      expect(x[0].getBoundingClientRect().x).equal(180);
      expect(x[0].getBoundingClientRect().y).equal(200);
    });
    cy.get("div[data-testid='2']").should((x) => {
      window.a = x;
      expect(x[0].getBoundingClientRect().x).equal(130);
      expect(x[0].getBoundingClientRect().y).equal(150);
    });
  });
});
