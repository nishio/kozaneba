/// <reference types="cypress" />

import { GroupItem, ItemId } from "../../../src/initializeGlobalState";

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
    const x1 = 55;
    const y1 = 170;
    cy.testid("1").should("hasPosition", [x1, y1]);

    const x2 = x1 + 5 + 25;
    const y2 = y1 + 5 + 25;
    cy.testid("2").should("hasPosition", [x2, y2]);

    const dx = 100;
    cy.updateGlobal((g) => {
      g.itemStore["1"].position = [dx, 0];
    });

    cy.testid("1").should("hasPosition", [x1 + dx, y1]);
    cy.testid("2").should("hasPosition", [x2 + dx, y2]);
    cy.testid("grouptitle-1").should("have.css", "height", "0px");

    cy.movidea((movidea) => {
      movidea.updateGlobal((g) => {
        const x = g.itemStore["1"] as GroupItem;
        x.position = [0, 0];
        x.title = "title";
      });
    });
    const title_height = 25;
    cy.contains("title").should("have.css", "height", title_height + "px");

    cy.movidea((movidea) => {
      movidea.updateGlobal((g) => {
        const x = g.itemStore["1"] as GroupItem;
        x.position = [0, 0];
        x.title = "long title ".repeat(10);
      });
    });
    cy.testid("2").should("hasPosition", [x2, y2 + title_height]);

    cy.contains("title").should("have.css", "height", title_height + "px"); // no wrap

    cy.movidea((movidea) => {
      movidea.updateGlobal((g) => {
        const x = g.itemStore["1"] as GroupItem;
        x.isOpen = false;
      });
    });

    cy.testid("1").should("hasPosition", [155, 170]);
  });
  it("move child", () => {
    cy.updateGlobal((g) => {
      g.itemStore["3"].position = [-100, 0];
    });
    cy.testid("1").should("hasPosition", [55, 170]);
    cy.testid("3").should("hasPosition", [85, 200]);

    cy.movidea((m) => {
      m.closeGroup("1" as ItemId);
    });
    cy.movidea((m) => {
      return expect(m.getGlobal().itemStore[1].position).to.deep.equal([
        -100, 0,
      ]);
    });
    cy.contains("A B");
    cy.testid("1").should("hasPosition", [55, 170]);
    cy.testid("nameplate-1").should("hasPosition", [85, 200]);

    cy.updateGlobal((g) => {
      (g.itemStore["1"] as GroupItem).isOpen = true;
    });
    cy.testid("1").should("hasPosition", [55, 170]);
    cy.testid("3").should("hasPosition", [85, 200]);
  });
});
