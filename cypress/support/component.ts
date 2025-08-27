
// Custom mount command for plain HTML/DOM testing
const mount = (template: string | (() => string)) => {
  const html = typeof template === 'function' ? template() : template;
  
  return cy.get('body').then(($body) => {
    $body.html(html);
  });
};

Cypress.Commands.add('mount', mount);

declare global {
  namespace Cypress {
    interface Chainable {
      mount(template: string | (() => string)): Chainable<JQuery<HTMLElement>>;
    }
  }
}