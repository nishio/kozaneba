/// <reference types="cypress" />
import { THICK_ARROW } from "../../../src/API/add_arrow";
import { TWorldCoord } from "../../../src/dimension/world_to_screen";
import { TItemId } from "../../../src/Global/TItemId";
import { ready_one_group } from "../../support";

describe("ready one group with one kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    cy.viewport(500, 500);
    ready_one_group();
  });

  it("arrow", () => {
    cy.movidea((m) =>
      m.make_one_kozane({
        id: "A" as TItemId,
        text: "A",
        position: [-200, 0] as TWorldCoord,
      })
    );
    cy.updateGlobal((g) => {
      g.annotations.push({
        type: "line",
        items: ["G1", "A"] as TItemId[],
        heads: ["arrow", "arrow"],
        custom: {},
        is_doubled: false,
      });
    });
  });
});
