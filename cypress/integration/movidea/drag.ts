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
    // 390 x 160
    const x1 = 55;
    const y1 = 170;
    cy.testid("1").should("hasPosition", [x1, y1]);

    cy.testid("1").trigger("dragstart", "center");
    cy.getGlobal((g) => g.mouseState).should("to.eql", "");
    cy.get("#canvas").trigger("drop", 250, 250);
    cy.testid("1").should("hasPosition", [x1, y1]);

    cy.testid("1").trigger("dragstart", "center");
    cy.get("#canvas").trigger("drop", 300, 300);
    cy.testid("1").should("hasPosition", [x1 + 50, y1 + 50]);

    cy.testid("1").trigger("dragstart", "center");
    cy.get("#canvas").trigger("drop", 250, 250);
    cy.testid("1").should("hasPosition", [x1, y1]);

    cy.testid("1").trigger("dragstart", "center");
    cy.get("#canvas").trigger("drop", 250, 250);
    cy.testid("1").should("hasPosition", [x1, y1]);

    cy.testid("1").trigger("dragstart", "topLeft");
    cy.get("#canvas").trigger("drop", 100, 100);
    cy.testid("1").should("hasPosition", [100, 100]);

    cy.testid("1").trigger("dragstart", "topLeft");
    cy.get("#canvas").trigger("drop", 0, 200);
    cy.testid("1").should("hasPosition", [0, 200]);

    cy.testid("1").trigger("dragstart", "center");
    cy.get("#canvas").trigger("drop", 250, 250);
    cy.testid("1").should("hasPosition", [x1, y1]);
  });

  it("is not selecting", () => {
    cy.testid("1").trigger("mousedown", "center");
    cy.testid("1").trigger("mousemove", "center");
    cy.testid("1").trigger("dragstart", "center");
    cy.getGlobal((g) => g.mouseState).should("to.eql", "");
    cy.get("#canvas").trigger("drop", 250, 250);
  });
  // it("out of screen", () => {
  //   cy.testid("1").trigger("dragstart", "topLeft");
  //   cy.get("#canvas").trigger("drop", 250, 250);
  //   cy.testid("1").should("hasPosition", [250, 250]); // out of screen

  //   cy.testid("1").trigger("dragstart", "topLeft");
  //   cy.get("#canvas").trigger("drop", 100, 100);
  //   cy.testid("1").should("hasPosition", [110, 100]); // effect

  //   cy.testid("1").trigger("dragstart", "topLeft");
  //   cy.get("#canvas").trigger("drop", 300, 300);
  //   cy.testid("1").should("hasPosition", [300, 300]); // out of screen

  //   cy.testid("1").trigger("dragstart", "center");
  //   cy.get("#canvas").trigger("drop", 250, 250);
  //   cy.testid("1").should("hasPosition", [110, 170]); // effect

  //   cy.testid("1").trigger("dragstart", "center");
  //   cy.get("#canvas").trigger("drop", 250, 250);
  //   cy.testid("1").should("hasPosition", [110, 170]); // effect
  // });

  // it("move child", () => {
  //   cy.updateGlobal((g) => {
  //     g.itemStore["3"].position = [-100, 0];
  //   });
  //   cy.testid("1").should("hasPosition", [55, 170]);
  //   cy.testid("3").should("hasPosition", [85, 200]);

  //   cy.movidea((m) => {
  //     m.closeGroup("1" as ItemId);
  //   });
  //   cy.movidea((m) => {
  //     return expect(m.getGlobal().itemStore[1].position).to.deep.equal([
  //       -100, 0,
  //     ]);
  //   });
  //   cy.contains("A B");
  //   cy.testid("1").should("hasPosition", [55, 170]);
  //   cy.testid("nameplate-1").should("hasPosition", [85, 200]);

  //   cy.updateGlobal((g) => {
  //     (g.itemStore["1"] as GroupItem).isOpen = true;
  //   });
  //   cy.testid("1").should("hasPosition", [55, 170]);
  //   cy.testid("3").should("hasPosition", [85, 200]);
  // });
});
