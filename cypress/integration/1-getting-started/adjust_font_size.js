/// <reference types="cypress" />

describe('adjust font size', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('first fusen', () => {
    cy.get('.fusen[data-testid=">あ"]').should("have.css", "font-size", "66px")
  })
  it('second fusen', () => {
    cy.get('.fusen').should('have.length', 12).eq(1).should("have.css", "font-size", "53px")
  })
  // it('third fusen', () => {
  //   cy.get('.fusen').eq(2).should("have.css", "font-size", "38px")
  // })
})
