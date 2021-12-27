/// <reference types="cypress" />

import { do_drag, ready_nested_group } from "../../support";

describe("ready nested groups", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    ready_nested_group();
  });
  // it("do nothing", () => {});
  // it("bug reproduction", () => {
  //   cy.movidea((m) =>
  //     m.make_one_kozane({
  //       id: "A" as any,
  //       text: "A",
  //       position: [-250, 0] as any,
  //     })
  //   );
  //   cy.kozaneba((k) => {
  //     k.add_arrow(["G2", "A"] as any, ["none", "none"]);
  //   });
  //   // cy.getGlobal((g) => {
  //   //   console.log(g.itemStore["G2"]);
  //   // });
  //   do_drag("1", "G1", 200, 200);
  //   // cy.getGlobal((g) => {
  //   //   console.log(g.itemStore["G2"]);
  //   // });
  // });

  it("bug", () => {
    // cy.getGlobal((g) => {
    //   console.log(g.itemStore["G2"]);
    // });
    // do_drag("1", "G1", 200, 200);
    // cy.getGlobal((g) => {
    //   console.log(g.itemStore["G2"]);
    // });

    cy.testid("1").should("hasPosition", [184, 199]);

    const condition = "dragG2" as string;
    const doX = condition === "doX";
    if (doX) {
      do_drag("G1", "ba", 0, 0);
      do_drag("G1", "G2", 0, 0);
      console.log("dragG1");
      cy.testid("1").should("hasPosition", [225, 225]);
    } else if (condition === "dragG2") {
      console.log("dragG2");
      do_drag("G2", "ba", 100, 100);
      cy.testid("1").should("hasPosition", [180, 230]);
    }

    cy.getGlobal((g) => {
      console.log("A:");
      console.log(g.itemStore["1"].position);
      console.log(g.itemStore["G1"].position);
      console.log(g.itemStore["G2"].position);
    });

    // 1: position: [0, 0],
    // G1:  [0, 0]
    // G2: [41, 26]

    do_drag("1", "ba", 100, 100);

    cy.getGlobal((g) => {
      console.log("B:");
      console.log(g.itemStore["1"].position);
      console.log(g.itemStore["G1"].position);
      console.log(g.itemStore["G2"].position);
    });

    let pos;
    if (doX) {
      // was: pos = [59, 74];
      pos = [100, 100];
    } else if (condition === "dragG2") {
      // was: pos = [104, 69];
      pos = [100, 100];
    } else {
      pos = [100, 100];
    }
    console.log("hasPosition", pos);
    cy.testid("1").should("hasPosition", pos);

    // without X delta [-84, -99]/ 1:left,top = -150,-150
    // with X delta [-125, -125]/ 1:left,top = -191px,-176px
  });
});
