export {};

declare global {
  namespace Cypress {
    interface Chainable {
      mount(html: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('mount', (html: string) => {
  cy.document().then((doc) => {
    doc.body.innerHTML = html;
  });
});
