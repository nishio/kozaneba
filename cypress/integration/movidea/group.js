/// <reference types="cypress" />

describe('group', () => {
  beforeEach(() => {
    cy.visit('/')
    const json = {
      "drawOrder": [1],
      "itemStore": {
        "1": { "type": "group", "id": 1, "position": [0, 0], "nameplate": null, "isOpen": true, "items": [2, 3] },
        "2": { "type": "piece", "id": 2, "position": [-100, 0], "text": "A", "compact": true, "scale": 1 },
        "3": { "type": "piece", "id": 3, "position": [100, 0], "text": "B", "compact": true, "scale": 1 }
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
    cy.get("div[data-testid='1']").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(30);
      expect(x[0].getBoundingClientRect().y).equal(150);
    })
    cy.get("div[data-testid='2']").should(x => {
      window.a = x;
      expect(x[0].getBoundingClientRect().x).equal(80);
      expect(x[0].getBoundingClientRect().y).equal(200);
    })
  })
})
