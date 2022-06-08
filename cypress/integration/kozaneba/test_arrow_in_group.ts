/// <reference types="cypress" />
import { TWorldCoord } from "../../../src/dimension/world_to_screen";
import { TItemId } from "../../../src/Global/TItemId";
import { do_drag } from "../../support";

describe("ready one group with one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
  });

  it("arrow1", () => {
    cy.movidea((m) =>
      m.make_one_kozane({
        id: "A" as TItemId,
        text: "A",
        position: [-150, 0] as TWorldCoord,
      })
    );
    cy.movidea((m) =>
      m.make_one_kozane({
        id: "B" as TItemId,
        text: "B",
        position: [150, 0] as TWorldCoord,
      })
    );
    cy.updateGlobal((g) => {
      g.annotations.push({
        type: "line",
        items: ["A", "B"] as TItemId[],
        heads: ["arrow", "arrow"],
        custom: {},
        is_doubled: false,
      });
    });
    cy.movidea((m) => {
      m.make_items_into_new_group(["A", "B"], { id: "G1", text: "G1" });
    });
    do_drag("G1", "ba", 0, 300);
  });
});
