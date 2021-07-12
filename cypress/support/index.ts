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

import { TMovidea } from "../../src/exposeGlobal";

declare global {
  namespace Cypress {
    interface Chainable {
      movidea(callback: (movidea: TMovidea) => void): Chainable<Element>;
    }
  }
}

Cypress.Commands.add("movidea", (callback: (movidea: TMovidea) => void) => {
  return cy
    .window()
    .its("movidea")
    .then((m) => {
      setTimeout(() => {
        callback(m);
      });
    });
});
