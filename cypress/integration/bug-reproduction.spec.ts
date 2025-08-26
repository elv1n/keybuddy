import { fireCombination } from '../helpers';

describe('Critical Bugs - Failing Tests', () => {
  beforeEach(() => {
    cy.visit('public/index.html');
  });

  it('should handle unbinding with different scopes correctly', () => {
    cy.onReady(({ bindKey, unbindKey, setScope }) => {
      const fn1 = cy.stub();
      const fn2 = cy.stub();

      bindKey('z', 'scope1', fn1);
      bindKey('z', 'scope2', fn2);

      setScope('scope1');
      fireCombination('z', () => {
        expect(fn1).to.have.callCount(1);
        expect(fn2).to.have.callCount(0);
      });

      setScope('scope2');
      fireCombination('z', () => {
        expect(fn1).to.have.callCount(1);
        expect(fn2).to.have.callCount(1);
      });

      unbindKey('z', 'scope1', fn1);
      setScope('scope1');
      fireCombination('z', () => {
        expect(fn1).to.have.callCount(1);
        expect(fn2).to.have.callCount(1);
      });
    });
  });

  it('should handle meta key variations correctly', () => {
    cy.onReady(({ bindKey }) => {
      const fn = cy.stub();

      bindKey('cmd+a', fn);

      cy.get('body')
        .trigger('keydown', { keyCode: 93, metaKey: true })
        .trigger('keydown', { keyCode: 65, metaKey: true })
        .then(() => {
          expect(fn).to.have.callCount(1);
        });

      cy.get('body')
        .trigger('keydown', { keyCode: 224, metaKey: true })
        .trigger('keydown', { keyCode: 65, metaKey: true })
        .then(() => {
          expect(fn).to.have.callCount(2);
        });
    });
  });

  it('should handle all four modifiers together', () => {
    cy.onReady(({ bindKey }) => {
      const fn = cy.stub();

      bindKey('ctrl+alt+shift+cmd+k', fn);

      cy.get('body')
        .type('{ctrl}{alt}{shift}{cmd}k')
        .then(() => {
          expect(fn).to.have.callCount(1);
        });

      cy.get('body')
        .type('{ctrl}{alt}{shift}k')
        .then(() => {
          expect(fn).to.have.callCount(1);
        });
    });
  });

  it('should differentiate between similar modifier combinations', () => {
    cy.onReady(({ bindKey }) => {
      const fn1 = cy.stub();
      const fn2 = cy.stub();
      const fn3 = cy.stub();

      bindKey('ctrl+shift+a', fn1);
      bindKey('alt+shift+a', fn2);
      bindKey('cmd+shift+a', fn3);

      cy.get('body')
        .type('{ctrl}{shift}a')
        .then(() => {
          expect(fn1).to.have.callCount(1);
          expect(fn2).to.have.callCount(0);
          expect(fn3).to.have.callCount(0);
        });

      cy.get('body')
        .type('{alt}{shift}a')
        .then(() => {
          expect(fn1).to.have.callCount(1);
          expect(fn2).to.have.callCount(1);
          expect(fn3).to.have.callCount(0);
        });

      cy.get('body')
        .type('{cmd}{shift}a')
        .then(() => {
          expect(fn1).to.have.callCount(1);
          expect(fn2).to.have.callCount(1);
          expect(fn3).to.have.callCount(1);
        });
    });
  });

  it('should handle Firefox-specific key codes', () => {
    cy.onReady(({ bindKey }) => {
      const fn1 = cy.stub();
      const fn2 = cy.stub();

      bindKey('-', fn1);
      bindKey('=', fn2);

      const isFirefox = navigator.userAgent.includes('Firefox');

      cy.get('body')
        .trigger('keydown', { keyCode: isFirefox ? 173 : 189 })
        .then(() => {
          expect(fn1).to.have.callCount(1);
        });

      cy.get('body')
        .trigger('keydown', { keyCode: isFirefox ? 61 : 187 })
        .then(() => {
          expect(fn2).to.have.callCount(1);
        });
    });
  });

  it('should handle caps lock key correctly', () => {
    cy.onReady(({ bindKey }) => {
      const fn = cy.stub();

      bindKey('capslock', fn);

      const isFirefox = navigator.userAgent.includes('Firefox');

      if (!isFirefox) {
        cy.get('body')
          .trigger('keydown', { keyCode: 20 })
          .then(() => {
            expect(fn).to.have.callCount(0);
          });
      }
    });
  });

  it('should handle binding to non-existent scope', () => {
    cy.onReady(({ bindKey, setScope }) => {
      const fn = cy.stub();

      bindKey('y', 'nonexistent', fn);

      setScope('nonexistent');
      fireCombination('y', () => {
        expect(fn).to.have.callCount(1);
      });

      setScope('all');
      fireCombination('y', () => {
        expect(fn).to.have.callCount(1);
      });
    });
  });

  it('should handle special punctuation keys', () => {
    cy.onReady(({ bindKey }) => {
      const tests = [
        { key: '.', code: 190 },
        { key: '/', code: 191 },
        { key: '`', code: 192 },
        { key: ';', code: 186 },
        { key: "'", code: 222 },
        { key: '[', code: 219 },
        { key: ']', code: 221 },
        { key: '\\', code: 220 },
      ];

      tests.forEach(({ key, code }) => {
        const fn = cy.stub();
        bindKey(key, fn);

        cy.get('body')
          .trigger('keydown', { keyCode: code })
          .then(() => {
            expect(fn).to.have.callCount(1);
          });
      });
    });
  });
});
