import { createKeybuddy } from '../../src';
import { DEFAULT_SCOPE } from '../../src/constants';
import { fireCombination } from '../helpers';

context('Test iframe bindings', () => {
  let iframeKeybuddy: ReturnType<typeof createKeybuddy>;

  beforeEach(() => {
    cy.mount(`
      <div>
        <h1>Main Document</h1>
        <iframe
          id="test-iframe"
          srcdoc="<!DOCTYPE html><html><body><div data-testid='iframe-content'>Iframe Content</div></body></html>"
          style="width: 400px; height: 300px; border: 1px solid #ccc;"
        ></iframe>
      </div>
    `);

    cy.get('#test-iframe').should('exist');

    cy.window().then((win) => {
      const iframe = win.document.getElementById(
        'test-iframe',
      ) as HTMLIFrameElement;
      const iframeDoc = iframe.contentDocument;

      if (!iframeDoc) {
        throw new Error('Iframe document not available');
      }

      cy.wrap(iframeDoc).as('iframeDoc');

      iframeKeybuddy = createKeybuddy(iframeDoc);
      iframeKeybuddy.setScope(DEFAULT_SCOPE);
    });
  });

  afterEach(() => {
    if (iframeKeybuddy) {
      iframeKeybuddy.destroy();
    }
  });

  it('should bind and trigger keyboard shortcuts in iframe', () => {
    const handler = cy.stub();

    iframeKeybuddy.bind('alt+k', handler);

    cy.get('@iframeDoc').then((iframeDoc) => {
      fireCombination('alt+k', iframeDoc as unknown as Document);
      expect(handler).to.have.callCount(1);
    });
  });

  it('should bind multiple shortcuts in iframe', () => {
    const handler1 = cy.stub();
    const handler2 = cy.stub();

    iframeKeybuddy.bind('ctrl+s', handler1);
    iframeKeybuddy.bind('shift+a', handler2);

    cy.get('@iframeDoc').then((iframeDoc) => {
      fireCombination('ctrl+s', iframeDoc as unknown as Document);
      fireCombination('shift+a', iframeDoc as unknown as Document);

      expect(handler1).to.have.callCount(1);
      expect(handler2).to.have.callCount(1);
    });
  });

  it('should unbind shortcuts in iframe', () => {
    const handler = cy.stub();

    iframeKeybuddy.bind('command+z', handler);

    cy.get('@iframeDoc').then((iframeDoc) => {
      fireCombination('command+z', iframeDoc as unknown as Document);
      expect(handler).to.have.callCount(1);

      iframeKeybuddy.unbind('command+z', handler);

      fireCombination('command+z', iframeDoc as unknown as Document);
      expect(handler).to.have.callCount(1);
    });
  });

  it('should handle scopes in iframe', () => {
    const defaultHandler = cy.stub();
    const customHandler = cy.stub();

    iframeKeybuddy.bind('e', DEFAULT_SCOPE, defaultHandler);
    iframeKeybuddy.bind('e', 'custom', customHandler);

    cy.get('@iframeDoc').then((iframeDoc) => {
      fireCombination('e', iframeDoc as unknown as Document);
      expect(defaultHandler).to.have.callCount(1);
      expect(customHandler).to.have.callCount(0);

      iframeKeybuddy.setScope('custom');
      fireCombination('e', iframeDoc as unknown as Document);

      expect(defaultHandler).to.have.callCount(1);
      expect(customHandler).to.have.callCount(1);
    });
  });

  it('should not trigger main document handlers from iframe events', () => {
    const mainHandler = cy.stub();
    const iframeHandler = cy.stub();

    cy.window().then((win) => {
      const iframe = win.document.getElementById(
        'test-iframe',
      ) as HTMLIFrameElement;
      const iframeDoc = iframe.contentDocument;

      if (!iframeDoc) {
        throw new Error('Iframe document not available');
      }

      const mainKeybuddy = createKeybuddy(win.document);
      mainKeybuddy.bind('ctrl+t', mainHandler);

      iframeKeybuddy.bind('ctrl+t', iframeHandler);

      fireCombination('ctrl+t', iframeDoc);

      expect(iframeHandler).to.have.callCount(1);
      expect(mainHandler).to.have.callCount(0);

      mainKeybuddy.destroy();
    });
  });

  it('should properly clean up iframe keybuddy instance', () => {
    const handler = cy.stub();

    iframeKeybuddy.bind('delete', handler);

    cy.get('@iframeDoc').then((iframeDoc) => {
      fireCombination('delete', iframeDoc as unknown as Document);
      expect(handler).to.have.callCount(1);

      iframeKeybuddy.destroy();

      fireCombination('delete', iframeDoc as unknown as Document);
      expect(handler).to.have.callCount(1);
    });
  });
});
