/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      onReady(callback: (keybuddy: any) => void): Chainable<Window>;
    }
  }
}

export {};
