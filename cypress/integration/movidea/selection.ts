/// <reference types="cypress" />

describe("selection", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    const json = {
      drawOrder: [1],
      itemStore: {
        1: {
          type: "group",
          id: 1,
          position: [0, 0],
          nameplate: null,
          isOpen: true,
          items: [2, 3],
          title: "",
          scale: 1,
        },
        2: {
          type: "piece",
          id: 2,
          position: [-100, 0],
          text: "A",
          compact: true,
          scale: 1,
        },
        3: {
          type: "piece",
          id: 3,
          position: [100, 0],
          text: "B",
          compact: true,
          scale: 1,
        },
      },
    };
    cy.viewport(500, 500);

    cy.movidea((movidea) => {
      movidea.setGlobal({
        drawOrder: json.drawOrder,
        itemStore: json.itemStore,
      });
    });
  });

  it("main", () => {
    cy.get("#canvas").trigger("mousedown", 50, 100);
    cy.getGlobal((g) => g.mouseState).should("eql", "selecting");
    cy.get("#canvas").trigger("mouseup", 300, 400);
    cy.getGlobal((g) => g.mouseState).should("eql", "");
    cy.getGlobal((g) => g.is_selected).should("eql", true);

    cy.movidea(m => m.reset_selection())
    cy.get("#canvas").trigger("mousedown", 50, 100);
    cy.get("#canvas").trigger("mouseup", 50, 100);
    cy.getGlobal((g) => g.is_selected).should("eql", false);

    cy.movidea(m => m.reset_selection())
    cy.visit("/#blank");
    const itemStore = {};
    const drawOrder = [];
    for (let x = -1; x < 2; x++) {
      for (let y = -1; y < 2; y++) {
        const id = `${x},${y}`;
        itemStore[id] = {
          type: "piece",
          id,
          position: [x * 200, y * 200],
          text: id,
          compact: true,
          scale: 1,
        };
        drawOrder.push(id);
      }
    }

    cy.updateGlobal((g) => {
      g.drawOrder = drawOrder;
      g.itemStore = itemStore;
    });
    cy.contains("0,0");

    cy.get("#canvas").trigger("mousedown", 150, 150);
    cy.get("#canvas").trigger("mouseup", 250, 250);
    cy.getGlobal((g) => g.selected_items).should("to.eql", ["0,0"]);

    cy.movidea(m => m.reset_selection())
    cy.get("#canvas").trigger("mousedown", 150, 150);
    cy.get("#canvas").trigger("mouseup", 450, 250);
    cy.getGlobal((g) => g.selected_items).should("to.eql", ["0,0", "1,0"]);

    {
      cy.movidea(m => m.reset_selection())
      cy.get("#canvas").trigger("mousedown", 150, 150);
      cy.get("#canvas").trigger("mouseup", 450, 450);
      const ret = ["0,0", "0,1", "1,0", "1,1"];
      cy.getGlobal((g) => g.selected_items).should("to.eql", ret);
    }

    // mousedown on Fusen
    // cy.movidea(m => m.reset_selection())
    // cy.get("#canvas").trigger("mousedown", 250, 250);
    // cy.get("#canvas").trigger("mouseup", 150, 150);
    // cy.getGlobal((g) => g.selected_items).should("to.eql", ["0,0"]);

    // inverted selection
    cy.movidea(m => m.reset_selection())
    cy.get("#canvas").trigger("mousedown", 350, 350);
    cy.get("#canvas").trigger("mouseup", 250, 250);
    cy.getGlobal((g) => g.selected_items).should("to.eql", ["0,0"]);

    // move items
    cy.movidea(m => m.reset_selection())
    cy.get("#canvas").trigger("mousedown", 150, 150);
    cy.get("#canvas").trigger("mouseup", 450, 450);
    const items = ["0,0", "0,1", "1,0", "1,1"];

    cy.getGlobal((g) => g.selected_items).should("to.eql", items);
    cy.getGlobal((g) => items.map((id) => g.itemStore[id].position)).should(
      "to.eql",
      [
        [0, 0],
        [0, 200],
        [200, 0],
        [200, 200],
      ]
    );
    cy.get("#selection-view").trigger("dragstart", 0, 2); // misterious 2px
    cy.get("#canvas").trigger("drop", 100, 100);
    cy.getGlobal((g) => items.map((id) => g.itemStore[id].position)).should(
      "to.eql",
      [
        [-50, -50],
        [-50, 150],
        [150, -50],
        [150, 150],
      ]
    );
  });
});
