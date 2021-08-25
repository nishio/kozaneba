/// <reference types="cypress" />

import { TGroupItem } from "../../../src/Group/GroupItem";
import {
  do_drag,
  ready_nested_group,
  ready_one_group,
  ready_one_kozane,
  ready_two_groups,
} from "../../support";

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
  it("nested group", () => {
    ready_nested_group();
    do_drag("1", "G2", 0, 0);
    cy.getGroup("G2", (g) => g.items).should("eql", ["G1", "1"]);

    do_drag("1", "G1", 0, 0);
    cy.getGroup("G2", (g) => g.items).should("eql", ["G1"]);
  });
  it("closed group in another group", () => {
    ready_nested_group();
    cy.updateGlobal((g) => {
      (g.itemStore["G1"] as TGroupItem).isOpen = false;
    });
    cy.testid("G1").should("hasPosition", [155, 170]);
    cy.testid("G2").should("hasPosition", [130, 120]);
  });
  it("drag inside", () => {
    ready_one_group();
    cy.testid("1").trigger("mousedown", 0, 0, { force: true });
    cy.testid("G1").trigger("mousemove", 0, 0, { force: true });
    cy.testid("G1").trigger("mouseup", 0, 0, { force: true });
    cy.testid("1").should("hasPosition", [154, 144]);
  });
  it("should not move when click", () => {
    cy.testid("G1").then((x: any) => {
      const { top, left } = x[0].style;
      cy.testid("G1").trigger("mousedown", 0, 0, { force: true });
      cy.testid("G1")
        .trigger("mouseup", 0, 0, { force: true })
        .then((x: any) => {
          expect(x[0].style.top).eql(top);
          expect(x[0].style.left).eql(left);
        });
    });
  });
});
