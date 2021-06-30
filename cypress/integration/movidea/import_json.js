/// <reference types="cypress" />

describe('group', () => {
  beforeEach(() => {
    cy.visit('/')
    const json = {
      "drawOrder": [2, 3],
      "itemStore": {
        "2": { "type": "piece", "id": 2, "position": [-100, 0], "text": "ABC", "compact": true, "scale": 1 },
        "3": { "type": "piece", "id": 3, "position": [100, 0], "text": "DEF", "compact": true, "scale": 1 }
      }
    }

    
    cy.window().its('movidea').then(movidea => {
      setTimeout(() => {
        movidea.setGlobal({
          drawOrder: json.drawOrder,
          itemStore: json.itemStore
         });        
      })
    });
  })

  it('position', () => {
    cy.viewport(500, 500)
    cy.contains("ABC").parent()
      .should("have.css", "top", "-50px")
      .should("have.css", "left", "-170px")
    cy.contains("DEF")
  })
})
