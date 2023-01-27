/// <reference types="cypress" />

import {
  do_click,
  ready_nested_group,
  ready_one_kozane,
} from "../../support/e2e";
import { make_get_group_func } from "../../utils";

describe("test ungroup", () => {
  beforeEach(() => {
    cy.visit("/#blank");
  });
  it("nested", () => {
    cy.viewport(500, 500);
    ready_nested_group();
    do_click("G1");
    cy.testid("group-ungroup").click();
    cy.getGlobal((g) => {
      return make_get_group_func("G2")(g).items;
    }).should("eql", ["G1", "1"]);
  });
  it("should be left top corner", () => {
    cy.setGlobal({ fix_timestamp_for_test: 0 });
    cy.kozaneba((k) => {
      k.add_multiple_kozane("A\nB\nC\nD\nE\nF");
    });
    cy.getGlobal(console.log);
    cy.updateGlobal((g) => {
      g.itemStore["1"].text = "Title";
    });

    do_click("1");
    cy.testid("group-ungroup").click();
  });
  it("no-title nested", () => {
    cy.viewport(500, 500);
    ready_one_kozane();
    cy.movidea((m) => {
      m.make_items_into_new_group(["1"], { id: "G1" });
      m.make_items_into_new_group(["G1"], { id: "G2" });
    });

    do_click("G1");
    cy.testid("group-ungroup").click();
    cy.getGlobal((g) => {
      return make_get_group_func("G2")(g).items;
    }).should("eql", ["1"]);
  });
});
