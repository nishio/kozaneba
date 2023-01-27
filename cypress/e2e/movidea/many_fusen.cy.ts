/// <reference types="cypress" />

describe("adjust font size", () => {
  beforeEach(() => {
    cy.visit("/");
    const fusens = [];
    for (let x = -10; x < 11; x++) {
      for (let y = -10; y < 11; y++) {
        fusens.push({ text: `${x},${y}`, x: x * 200, y: y * 200 });
      }
    }
    cy.window()
      .its("movidea")
      .then((movidea) => {
        setTimeout(() => {
          movidea.setGlobal({ fusens });
        });
      });
  });

  it("position", () => {});
});
