// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
// import "@testing-library/cypress/add-commands";
// import "@cypress/code-coverage/support";

// import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

import { State } from "reactn/default";
import { TWorldCoord } from "../../src/dimension/world_to_screen";
import { TMovidea } from "../../src/Global/exposeGlobal";
import { ItemId } from "../../src/Global/initializeGlobalState";
import { TGroupItem } from "../../src/Group/GroupItem";

declare global {
  namespace Cypress {
    interface Chainable {
      movidea(callback: (movidea: TMovidea) => void): Chainable<Element>;
      testid(testid: string): Chainable<Element>;
      updateGlobal(callback: (g: State) => void): Chainable<Element>;
      getGlobal(callback: (g: State) => unknown): Chainable<unknown>;
      setGlobal(g: Partial<State>): Chainable<unknown>;
      getGroup(
        id: string,
        callback: (g: TGroupItem) => unknown
      ): Chainable<unknown>;
    }
  }
}

Cypress.Commands.add("movidea", (callback: (movidea: TMovidea) => void) => {
  const to_async = false;
  return cy
    .window()
    .its("movidea")
    .then((m) => {
      if (to_async) {
        setTimeout(() => {
          callback(m);
        });
      } else {
        callback(m);
      }
    });
});

Cypress.Commands.add("testid", (testid: string) => {
  return cy.get(`*[data-testid='${testid}']`);
});

Cypress.Commands.add("updateGlobal", (callback: (g: State) => void) => {
  return cy.movidea((movidea) => {
    movidea.updateGlobal(callback);
  });
});

Cypress.Commands.add("getGlobal", (callback: (g: State) => unknown) => {
  return cy.movidea((movidea) => {
    return cy.wrap(callback(movidea.getGlobal()));
  });
});

Cypress.Commands.add("setGlobal", (g: Partial<State>) => {
  return cy.movidea((movidea) => {
    movidea.setGlobal(g);
  });
});

Cypress.Commands.add(
  "getGroup",
  (id: string, callback: (g: TGroupItem) => unknown) => {
    return cy.movidea((movidea) => {
      return cy.wrap(callback(movidea.getGlobal().itemStore[id] as TGroupItem));
    });
  }
);

chai.use((_chai, utils) => {
  function hasPosition(options) {
    const [x, y] = options;
    const cr = this._obj[0].getBoundingClientRect();
    if (cr.x !== x || cr.y !== y) {
      console.log("hasPosition failed", cr);
    }
    this.assert(
      cr.x === x,
      `expected x:${cr.x} is ${x}`,
      `expected x:${cr.x} is not ${x}`,
      cr.x
    );
    this.assert(
      cr.y === y,
      `expected y:${cr.y} is ${y}`,
      `expected y:${cr.y} is not ${y}`,
      cr.y
    );
  }

  _chai.Assertion.addMethod("hasPosition", hasPosition);
});

export const ready_one_group = () => {
  cy.movidea((m) => {
    m.make_one_kozane({ id: "1" as ItemId, text: "1" });
    m.make_items_into_new_group(["1"], { id: "G1", text: "G1" });
  });
};

export const ready_one_kozane = () => {
  cy.movidea((m) => m.make_one_kozane({ id: "1" as ItemId, text: "1" }));
};

export const ready_two_groups = () => {
  cy.movidea((m) => {
    m.make_one_kozane({
      id: "1" as ItemId,
      text: "1",
      position: [-100, 0] as TWorldCoord,
    });
    m.make_items_into_new_group(["1"], { id: "G1", text: "G1" });
    m.make_one_kozane({
      id: "2" as ItemId,
      text: "2",
      position: [100, 0] as TWorldCoord,
    });
    m.make_items_into_new_group(["2"], { id: "G2", text: "G2" });
  });
};

export const ready_nested_group = () => {
  cy.movidea((m) => {
    m.make_one_kozane({
      id: "1" as ItemId,
      text: "1",
      position: [0, 0] as TWorldCoord,
    });
    m.make_items_into_new_group(["1"], { id: "G1", text: "G1" });
    m.make_items_into_new_group(["G1"], { id: "G2", text: "G2" });
  });
};

export const do_drag = (
  target: string,
  destination: string,
  x: number,
  y: number
) => {
  cy.testid(target).trigger("mousedown");
  cy.testid("ba").trigger("mousemove", { force: true });
  cy.testid(destination).trigger("mouseup", x, y, { force: true });
};

export const do_click = (target: string) => {
  cy.testid(target).trigger("mousedown", 0, 0, { force: true });
  cy.testid("ba").trigger("mouseup");
};
