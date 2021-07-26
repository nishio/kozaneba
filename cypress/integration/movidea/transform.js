/// <reference types="cypress" />

describe("transform", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    const fusens = [
      {
        text: "+",
        x: 0,
        y: 0,
      },
      {
        text: "*",
        x: 250,
        y: 250,
      },
    ];

    cy.window()
      .its("movidea")
      .then((movidea) => {
        setTimeout(() => {
          movidea.setGlobal({ fusens });
        });
      });
  });

  it("position", () => {
    cy.viewport(500, 500);
    cy.contains("+").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(186);
      expect(x[0].getBoundingClientRect().y).equal(213);
    });
    cy.contains("*").should((x) => {
      window.a = x;
      expect(x[0].getBoundingClientRect().x).equal(436);
      expect(x[0].getBoundingClientRect().y).equal(463);
    });

    cy.window()
      .its("movidea")
      .then((movidea) => {
        setTimeout(() => {
          movidea.setGlobal({ scale: 0.5 });
        });
      });

    cy.contains("+").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(218);
      expect(x[0].getBoundingClientRect().y).equal(231.5);
    });
    cy.contains("*").should((x) => {
      window.a = x;
      expect(x[0].getBoundingClientRect().x).equal(343);
      expect(x[0].getBoundingClientRect().y).equal(356.5);
    });
  });
});
