/// <reference types="cypress" />
import { getGlobal, setGlobal } from "reactn";
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
    cy.window().then(target => {
      window.target = target;
    })
    cy.window().its('movidea').then(movidea => {
      window.movidea = movidea;
      console.log(movidea)
      // console.log(movidea.getGlobal())
      // debugger;
      // movidea.setGlobal({ fusens });
      // movidea.Provider.setGlobal({ fusens });

      // movidea.setGlobal({ fusens: [{ text: "1" }] });
      // movidea.Provider.setGlobal({ fusens: [{ text: "2" }] });
      // window.target.movidea.Provider.setGlobal({ fusens: [{ text: "2" }] })
      // setGlobal({ fusens });
      console.log("movidea resolved")
      // setTimeout(movidea.foo, 1000)
      movidea.foo()

      console.log(fusens)
      console.log("ok")
      console.log(movidea.getGlobal())
    });
    // cy.window().its('movidea').invoke("setGlobal", {fusens})
  })

  it('first fusen', () => {
    // aa
    cy.get('.fusen[data-testid=">あ"]').should("have.css", "font-size", "66px")
  })
  it('second fusen', () => {
    cy.get('.fusen').should('have.length', 12).eq(1).should("have.css", "font-size", "53px")
  })
  // it('third fusen', () => {
  //   cy.get('.fusen').eq(2).should("have.css", "font-size", "38px")
  // })
})
