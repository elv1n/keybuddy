import { createKeybuddy } from '../../src/keybuddy';

describe('Modifier key detection', () => {
  let kb: ReturnType<typeof createKeybuddy>;

  beforeEach(() => {
    kb = createKeybuddy(document, () => true);
  });

  afterEach(() => {
    kb.destroy();
  });

  it('should trigger cmd+a shortcut (Meta key must not pollute downKeys)', () => {
    const handler = cy.stub().as('handler');
    kb.bind('cmd+a', handler);

    cy.document().then((doc) => {
      doc.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Meta',
          metaKey: true,
          bubbles: true,
        }),
      );
      doc.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'a',
          metaKey: true,
          bubbles: true,
        }),
      );
    });

    cy.get('@handler').should('have.been.calledOnce');
  });
});
