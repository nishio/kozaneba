/// <reference types="cypress" />

import { V2 } from "../../../src/dimension/V2";
import { TWorldCoord } from "../../../src/dimension/world_to_screen";
import { ItemId } from "../../../src/Global/initializeGlobalState";
import { TArrowHead } from "../../../src/Global/TAnnotation";

const add_kozane = (label: string, position: V2) => {
  cy.movidea((m) =>
    m.make_one_kozane({
      id: label as ItemId,
      text: label,
      position: position as TWorldCoord,
    })
  );
};

const add_arrow = (items: string[], heads: TArrowHead[], custom = {}) => {
  cy.updateGlobal((g) => {
    g.annotations.push({
      type: "line",
      items: items as ItemId[],
      heads,
      custom,
    });
  });
};

describe("ready two kozane", () => {
  beforeEach(() => {
    cy.visit("/#blank");
    add_kozane("X", [0, 0]);
    add_kozane("Y", [0, 200]);
    add_kozane("X+Y", [200, 100]);
    add_kozane("X+1", [-200, 0]);
    add_kozane("Y-1", [400, 200]);

    add_arrow(["X", "Y", "X+Y"], ["none", "none", "arrow"], {
      stroke_width: 10,
      arrow_head_size: 30,
      opacity: 1,
      is_clickable: true,
    });
    add_arrow(["X", "X+1"], ["arrow", "none"]);
    add_arrow(["Y", "Y-1"], ["none", "arrow"]);
  });

  it("do nothing", () => {});
});
