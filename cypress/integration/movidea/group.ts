/// <reference types="cypress" />

import { GroupItem } from "../../../src/initializeGlobalState";

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
    cy.get("div[data-testid='1']").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(x1);
      expect(x[0].getBoundingClientRect().y).equal(y1);
    });
    const x2 = x1 + 5 + 25;
    const y2 = y1 + 5 + 25;
    cy.get("div[data-testid='2']").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(x2);
      expect(x[0].getBoundingClientRect().y).equal(y2);
    });

    const dx = 100;
    cy.movidea((movidea) => {
      movidea.updateGlobal((g) => {
        g.itemStore["1"].position = [dx, 0];
      });
    });

    cy.get("div[data-testid='1']").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(x1 + dx);
      expect(x[0].getBoundingClientRect().y).equal(y1);
    });
    cy.get("div[data-testid='2']").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(x2 + dx);
      expect(x[0].getBoundingClientRect().y).equal(y2);
    });
    cy.get("span[data-testid='grouptitle-1']").should(
      "have.css",
      "height",
      "0px"
    );

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
    cy.get("div[data-testid='2']").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(x2);
      expect(x[0].getBoundingClientRect().y).equal(y2 + title_height);
    });

    cy.contains("title").should("have.css", "height", title_height + "px"); // no wrap

    cy.movidea((movidea) => {
      movidea.updateGlobal((g) => {
        const x = g.itemStore["1"] as GroupItem;
        x.isOpen = false;
      });
    });

    cy.get("div[data-testid='1']").should((x) => {
      expect(x[0].getBoundingClientRect().x).equal(159);
      expect(x[0].getBoundingClientRect().y).equal(174);
    });
  });
  it("move child", () => {
    cy.movidea((movidea) => {
      movidea.updateGlobal((g) => {
        g.itemStore["3"].position = [-100, 0];
      });
    });
  });
});
