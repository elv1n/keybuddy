import * as keyBuddy from '../../src';
import { fireCombination } from '../helpers';

describe('Known Behaviors - Document Expected Functionality', () => {
  beforeEach(() => {
    cy.mount('<div data-testid="test-container">Test Component</div>');
  });

  afterEach(() => {
    keyBuddy.unbindAll();
  });

  it('should clear all downKeys when meta key is released', () => {
    const fn = cy.stub();

    keyBuddy.bindKey('cmd+z+x', fn);

    fireCombination('cmd+z+x');
    expect(fn).to.have.callCount(1);

    cy.get('[data-testid="test-container"]')
      .trigger('keyup', { key: 'Meta' })
      .trigger('keydown', { key: 'X' })
      .then(() => {
        expect(fn).to.have.callCount(1);
      });
  });

  it('should handle sequence binding like "cmd+z y" (cmd+z followed by y)', () => {
    const fn = cy.stub();

    keyBuddy.bindKey('cmd+z y', fn);

    cy.get('[data-testid="test-container"]')
      .trigger('keydown', { key: 'Meta', metaKey: true })
      .trigger('keydown', { key: 'Z', metaKey: true })
      .trigger('keyup', { key: 'Z', metaKey: true })
      .trigger('keyup', { key: 'Meta' })
      .then(() => {
        expect(fn).to.have.callCount(0);
      });

    cy.get('[data-testid="test-container"]')
      .trigger('keydown', { key: 'Y' })
      .trigger('keyup', { key: 'Y' })
      .then(() => {
        expect(fn).to.have.callCount(1);
      });
  });

  it('should NOT clear downKeys for sequence bindings when meta is still held', () => {
    const fn = cy.stub();

    keyBuddy.bindKey('cmd+z+y', fn);

    fireCombination('cmd+z+y');
    expect(fn).to.have.callCount(1);

    cy.get('[data-testid="test-container"]')
      .trigger('keyup', { key: 'Y' })
      .trigger('keyup', { key: 'Z' })
      .trigger('keyup', { key: 'Meta' })
      .then(() => {
        expect(fn).to.have.callCount(1);
      });
  });

  it('should differentiate between "cmd+z y" (sequence) and "cmd+z+y" (combination)', () => {
    const seqFn = cy.stub();
    const comboFn = cy.stub();

    keyBuddy.bindKey('cmd+z y', seqFn);
    keyBuddy.bindKey('cmd+z+y', comboFn);

    fireCombination('cmd+z+y');
    expect(comboFn).to.have.callCount(1);
    expect(seqFn).to.have.callCount(0);

    cy.get('[data-testid="test-container"]')
      .trigger('keyup', { key: 'Y' })
      .trigger('keyup', { key: 'Z' })
      .trigger('keyup', { key: 'Meta' });

    cy.get('[data-testid="test-container"]')
      .trigger('keydown', { key: 'Meta', metaKey: true })
      .trigger('keydown', { key: 'Z', metaKey: true })
      .trigger('keyup', { key: 'Z' })
      .trigger('keyup', { key: 'Meta' })
      .trigger('keydown', { key: 'Y' })
      .then(() => {
        expect(seqFn).to.have.callCount(1);
        expect(comboFn).to.have.callCount(1);
      });
  });

  it('should maintain downKeys state correctly during normal operation', () => {
    const fn = cy.stub();

    keyBuddy.bindKey('a+b+c', fn);

    fireCombination('a+b+c');
    expect(fn).to.have.callCount(1);

    cy.get('[data-testid="test-container"]')
      .trigger('keyup', { key: 'B' })
      .then(() => {
        expect(fn).to.have.callCount(1);
      });

    cy.get('[data-testid="test-container"]')
      .trigger('keydown', { key: 'C' })
      .then(() => {
        expect(fn).to.have.callCount(1);
      });
  });

  it('should handle window focus reset correctly', () => {
    const fn = cy.stub();

    keyBuddy.bindKey('ctrl+f+g', fn);

    fireCombination('ctrl+f+g');
    expect(fn).to.have.callCount(1);

    cy.window().blur();
    cy.window().focus();

    fireCombination('ctrl+g');
    expect(fn).to.have.callCount(1);
  });

  describe.skip('should not trigger on elements by default', () => {
    it('should not trigger on textarea elements by default', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('t', fn);

      cy.get('[data-testid="test-textarea"]')
        .focus()
        .type('t')
        .then(() => {
          expect(fn).to.have.callCount(0);
        });
    });

    it('should not trigger on contenteditable elements by default', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('c', fn);

      cy.get('[data-testid="test-editable"]')
        .focus()
        .type('c')
        .then(() => {
          expect(fn).to.have.callCount(0);
        });
    });

    it('should not trigger on select elements by default', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('s', fn);

      cy.get('[data-testid="test-select"]')
        .focus()
        .type('s')
        .then(() => {
          expect(fn).to.have.callCount(0);
        });
    });

    it('should not trigger on input elements by default', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('e', fn);

      cy.get('[data-testid="test-input"]')
        .focus()
        .type('e')
        .then(() => {
          expect(fn).to.have.callCount(0);
        });

      cy.get('[data-testid="test-container"]').click();

      fireCombination('e');
      expect(fn).to.have.callCount(1);
    });
  });
});
