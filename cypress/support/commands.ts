// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import * as keyBuddy from '../../src';

const onReady = (
  callback: (keybuddy: typeof keyBuddy) => void
): Cypress.Chainable<Window> =>
  cy.window().then(({ keybuddy }) => {
    callback(keybuddy);
  });

// eslint-disable-next-line @typescript-eslint/no-use-before-define
Cypress.Commands.add('onReady', onReady);

declare global {
  interface Window {
    // eslint-disable-next-line no-undef
    keybuddy: typeof keyBuddy;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace,no-redeclare
  namespace Cypress {
    interface Chainable {
      // eslint-disable-next-line no-undef
      onReady: typeof onReady;
    }
  }
}
