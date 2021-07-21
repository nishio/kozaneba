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
import { TMovidea } from "../../src/exposeGlobal";

declare global {
  namespace Cypress {
    interface Chainable {
      movidea(callback: (movidea: TMovidea) => void): Chainable<Element>;
      testid(testid: string): Chainable<Element>;
      updateGlobal(callback: (g: State) => void): Chainable<Element>;
      getGlobal(callback: (g: State) => unknown): Chainable<unknown>;
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

chai.use((_chai, utils) => {
  function hasPosition(options) {
    const [x, y] = options;
    const cr = this._obj[0].getBoundingClientRect();

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
