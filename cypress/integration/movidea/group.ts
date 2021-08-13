/// <reference types="cypress" />

import { xorBy } from "cypress/types/lodash";
import { ItemId } from "../../../src/Global/initializeGlobalState";
import { GroupItem, TGroupItem } from "../../../src/Group/GroupItem";
import { piece_to_kozane } from "../../../src/utils/piece_to_kozane";
import { get_group } from "../../utils";

describe("group", () => {
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
          text: "",
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
    piece_to_kozane(json.itemStore);

    cy.movidea((movidea) => {
      movidea.setGlobal({
        drawOrder: json.drawOrder,
        itemStore: json.itemStore,
      });
    });
  });

  it("main", () => {
    const x1 = 54;
    const y1 = 169;
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
        const x = g.itemStore["1"] as TGroupItem;
        x.position = [0, 0];
        x.text = "title";
      });
    });
    const title_height = 25;
    cy.contains("title").should("have.css", "height", title_height + "px");
    cy.testid("2").should("hasPosition", [x2, y2]); // should not change even if title exists

    cy.movidea((movidea) => {
      movidea.updateGlobal((g) => {
        const x = g.itemStore["1"] as TGroupItem;
        x.position = [0, 0];
        x.text = "long title ".repeat(10);
      });
    });

    cy.contains("title").should("have.css", "height", title_height + "px"); // no wrap

    cy.movidea((movidea) => {
      movidea.updateGlobal((g) => {
        const x = g.itemStore["1"] as TGroupItem;
        x.isOpen = false;
      });
    });

    cy.testid("1").should("hasPosition", [155, 170]);
  });

  it("move child", () => {
    cy.updateGlobal((g) => {
      g.itemStore["3"].position = [-100, 0];
    });
    cy.testid("1").should("hasPosition", [54, 169]);
    cy.testid("3").should("hasPosition", [84, 199]);

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
    cy.testid("nameplate-1").should("hasPosition", [84, 199]);

    cy.updateGlobal((g) => {
      (g.itemStore["1"] as TGroupItem).isOpen = true;
    });
    cy.testid("1").should("hasPosition", [54, 169]);
    cy.testid("3").should("hasPosition", [84, 199]);
  });

  it("open/close", () => {
    cy.testid("1").click();
    cy.testid("group-open-close").click();
    cy.getGroup("1", (g) => g.isOpen).should("be.false");

    cy.testid("1").click();
    cy.testid("group-open-close").click();
    cy.getGroup("1", (g) => g.isOpen).should("be.true");
  });

  it("delete chiild", () => {
    cy.testid("2").click();
    cy.testid("kozane-delete").click();
    cy.getGroup("1", (g) => g.items).should("eql", [3]);
  });
});
