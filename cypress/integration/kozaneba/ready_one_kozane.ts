/// <reference types="cypress" />

import { ItemId } from "../../../src/Global/initializeGlobalState";

describe("ready one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    cy.movidea((m) => m.make_one_kozane({ id: "1" as ItemId, text: "1" }));
  });

  it("drag", () => {
    const init_x = 184;
    const init_y = 199;
    cy.testid("1").trigger("mousedown", "center"); // equal [250, 250]
    cy.getGlobal((g) => g.itemStore["1"].position).should("eql", [0, 0]);
    cy.testid("1").should("hasPosition", [init_x, init_y]);

    cy.testid("ba").trigger("mousemove", 240, 240, { force: true });
    cy.getGlobal((g) => g.itemStore["1"].position).should("eql", [0, 0]);
    cy.testid("1").should("hasPosition", [init_x - 10, init_y - 10]);

    cy.testid("ba").trigger("mouseup", 230, 230);
    cy.getGlobal((g) => g.itemStore["1"].position).should("eql", [-20, -20]);
    cy.testid("1").should("hasPosition", [init_x - 20, init_y - 20]);
  });

  it("drag scaled", () => {
    cy.setGlobal({ scale: 0.5 });
    const init_x = 217;
    const init_y = 224.5;
    cy.testid("1").trigger("mousedown", "center"); // equal [250, 250]
    cy.getGlobal((g) => g.itemStore["1"].position).should("eql", [0, 0]);
    cy.testid("1").should("hasPosition", [init_x, init_y]);

    cy.testid("ba").trigger("mousemove", 240, 240, { force: true });
    cy.getGlobal((g) => g.itemStore["1"].position).should("eql", [0, 0]);
    cy.testid("1").should("hasPosition", [init_x - 10, init_y - 10]);

    cy.testid("ba").trigger("mouseup", 230, 230);
    cy.getGlobal((g) => g.itemStore["1"].position).should("eql", [-40, -40]);
    cy.testid("1").should("hasPosition", [init_x - 20, init_y - 20]);
  });

  it("main", () => {});
});
