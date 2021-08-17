/// <reference types="cypress" />

import { ready_one_kozane } from "./ready_one_kozane";
import { ready_two_groups } from "./ready_two_groups";

describe("drag", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
  });

  it("one kozane", () => {
    ready_one_kozane();
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

  it("one kozane scaled", () => {
    ready_one_kozane();
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

  it("two groups", () => {
    ready_two_groups();
    const init_x = 84;
    const init_y = 199;

    // go out
    cy.testid("1").trigger("mousedown", "center"); // is [150, 250]
    cy.getGlobal((g) => g.itemStore["1"].position).should("eql", [0, 0]); // it is position in the parent group
    cy.testid("1").should("hasPosition", [init_x, init_y]);

    cy.testid("ba").trigger("mousemove", 150, 400);
    cy.getGlobal((g) => g.itemStore["1"].position).should("eql", [0, 0]); // not updated
    cy.testid("1").should("hasPosition", [init_x, init_y + 150]);

    cy.testid("ba").trigger("mouseup", 150, 400);
    cy.getGlobal((g) => g.itemStore["1"].position).should("eql", [-100, 150]); // it is position on the ba
    cy.testid("1").should("hasPosition", [init_x, init_y + 150]);
    // group G1 should be empty
    cy.getGroup("G1", (g) => g.items).should("eql", []);

    // group to group
    cy.testid("2").trigger("mousedown", "center");
    cy.testid("ba").trigger("mousemove", 150, 400);
    cy.testid("G1").trigger("mouseup");
    cy.getGroup("G1", (g) => g.items).should("eql", ["2"]);

    // go into group
    cy.testid("1").trigger("mousedown", "center");
    cy.testid("ba").trigger("mousemove", 150, 400);
    cy.testid("G2").trigger("mouseup");
    cy.getGroup("G2", (g) => g.items).should("eql", ["1"]);
  });
});
