/// <reference types="cypress" />

describe('adjust font size', () => {
  beforeEach(() => {
    cy.visit('/')
    const fusens = [{
      text: "+",
      x: 0,
      y: 0,
    },
    {
      text: "*",
      x: 250,
      y: 250,
    }];

    cy.window().its('movidea').then(movidea => {
      setTimeout(() => {
        movidea.setGlobal({ fusens });        
      })
    });
  })

  it('position', () => {
    cy.viewport(500, 500)
    cy.contains("+").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(181);
      expect(x[0].getBoundingClientRect().y).equal(201);
    })
    cy.contains("*").should(x => {
      window.a = x;
      expect(x[0].getBoundingClientRect().x).equal(431);
      expect(x[0].getBoundingClientRect().y).equal(451);
    })
  })
})
