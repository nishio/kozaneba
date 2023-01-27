/// <reference types="cypress" />

import { TGroupItem } from "../../../src/Global/TGroupItem";
import {
  KOZANE_BORDER,
  KOZANE_WIDTH,
} from "../../../src/utils/kozane_constants";
import { GROUP_FORCED_PADDING } from "../../../src/dimension/get_group_bounding_box";

import {
  do_drag,
  ready_nested_group,
  ready_one_group,
  ready_one_kozane,
  ready_two_groups,
} from "../../support/e2e";
import { TITLE_HEIGHT } from "../../../src/dimension/BORDER";
import { constants } from "../../../src/API/constants";

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

  it("drag inside", () => {
    ready_one_group();
    cy.testid("1").should("hasPosition", [184, 199]);
    do_drag("1", "G1", 0, 0);
    cy.testid("1").should("hasPosition", [
      154 - GROUP_FORCED_PADDING,
      199 - TITLE_HEIGHT - constants.group_padding - 30,
    ]);
  });

  it("should not move when click", () => {
    ready_nested_group();
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

  it("bug fix: drag out from nested groups(drag G1 in/out)", () => {
    ready_nested_group();
    cy.testid("1").should("hasPosition", [184, 199]);

    do_drag("G1", "ba", 0, 0);
    do_drag("G1", "G2", 0, 0);
    cy.testid("1").should("hasPosition", [225, 225]);

    do_drag("1", "ba", 100, 100);

    let pos = [100, 100];
    // was: pos = [59, 74];
    cy.testid("1").should("hasPosition", pos);
  });

  // Broken
  // it("bug fix: drag out from nested groups(drag G2)", () => {
  //   ready_nested_group();
  //   cy.testid("1").should("hasPosition", [184, 199]);

  //   do_drag("G2", "ba", 100, 100);
  //   cy.testid("1").should("hasPosition", [180, 230]);
  //   do_drag("1", "ba", 100, 100);

  //   let pos = [100, 100];
  //   // was: pos = [104, 69];
  //   cy.testid("1").should("hasPosition", pos);
  // });

  // it("closed group in another group", () => {
  //   ready_nested_group();
  //   cy.updateGlobal((g) => {
  //     (g.itemStore["G1"] as TGroupItem).isOpen = false;
  //   });

  //   cy.testid("G1").should("hasPosition", [
  //     250 - KOZANE_WIDTH / 2 - GROUP_FORCED_PADDING - KOZANE_BORDER - 30,
  //     170 - GROUP_FORCED_PADDING - KOZANE_BORDER - TITLE_HEIGHT,
  //   ]); // 155, 170 => 129, 119
  //   cy.testid("G2").should("hasPosition", [104, 69]);
  // });
});
