/// <reference types="cypress" />

describe('adjust font size', () => {
  beforeEach(() => {
    cy.visit('/')
    let a = 1;
    let b = 1;
    const fusens = [];
    for (let i = 0; i < 11; i++) {
      [a, b] = [b, a + b];
      fusens.push({
        text: ">" + "あ".repeat(a),
        x: 50 * i,
        y: 50 * i,
      });
    }
    cy.window().its('movidea').then(movidea => {
      setTimeout(() => {
        movidea.setGlobal({ fusens });        
      })
    });
  })

  it('fusen sizes', () => {
    cy.get('.fusen').should('have.length', 12).first()
      .should("have.css", "font-size", "66px")
      .should("not.have.css", "align-items", "flex-start")
    cy.get('.fusen').eq(1).should("have.css", "font-size", "53px")
    cy.get('.fusen').eq(2).should("have.css", "font-size", "38px")
    cy.get('.fusen').eq(10)
      .should("have.css", "font-size", "10px")
      .should("have.css", "align-items", "flex-start")
  })
})
