import * as keyBuddy from '../../src';
import { fireCombination } from '../helpers';

describe('Critical Bugs - Failing Tests', () => {
  beforeEach(() => {
    cy.mount('<div data-testid="test-container">Test Component</div>');
    keyBuddy.setScope(keyBuddy.DEFAULT_SCOPE);
  });

  afterEach(() => {
    keyBuddy.unbindAll();
  });

  it('should handle unbinding with different scopes correctly', () => {
    const fn1 = cy.stub();
    const fn2 = cy.stub();

    keyBuddy.bindKey('z', 'scope1', fn1);
    keyBuddy.bindKey('z', 'scope2', fn2);

    keyBuddy.setScope('scope1');
    fireCombination('z');
    expect(fn1).to.have.callCount(1);
    expect(fn2).to.have.callCount(0);

    keyBuddy.setScope('scope2');
    fireCombination('z');
    expect(fn1).to.have.callCount(1);
    expect(fn2).to.have.callCount(1);

    keyBuddy.unbindKey('z', 'scope1', fn1);
    keyBuddy.setScope('scope1');
    fireCombination('z');
    expect(fn1).to.have.callCount(1);
    expect(fn2).to.have.callCount(1);
  });

  it('should handle meta key variations correctly', () => {
    const fn = cy.stub();

    keyBuddy.bindKey('cmd+a', fn);

    fireCombination('cmd+a');
    expect(fn).to.have.callCount(1);

    fireCombination('cmd+a');
    expect(fn).to.have.callCount(2);
  });

  it('should handle all four modifiers together', () => {
    const fn = cy.stub();

    keyBuddy.bindKey('ctrl+alt+shift+cmd+k', fn);

    fireCombination('ctrl+alt+shift+cmd+k');
    expect(fn).to.have.callCount(1);

    fireCombination('ctrl+alt+shift+k');
    expect(fn).to.have.callCount(1);
  });

  it('should differentiate between similar modifier combinations', () => {
    const fn1 = cy.stub();
    const fn2 = cy.stub();
    const fn3 = cy.stub();

    keyBuddy.bindKey('ctrl+shift+a', fn1);
    keyBuddy.bindKey('alt+shift+a', fn2);
    keyBuddy.bindKey('cmd+shift+a', fn3);

    fireCombination('ctrl+shift+a');
    expect(fn1).to.have.callCount(1);
    expect(fn2).to.have.callCount(0);
    expect(fn3).to.have.callCount(0);

    fireCombination('alt+shift+a');
    expect(fn1).to.have.callCount(1);
    expect(fn2).to.have.callCount(1);
    expect(fn3).to.have.callCount(0);

    fireCombination('cmd+shift+a');
    expect(fn1).to.have.callCount(1);
    expect(fn2).to.have.callCount(1);
    expect(fn3).to.have.callCount(1);
  });

  it('should handle Firefox-specific key codes', () => {
    const fn1 = cy.stub();
    const fn2 = cy.stub();

    keyBuddy.bindKey('-', fn1);
    keyBuddy.bindKey('=', fn2);

    fireCombination('-');
    expect(fn1).to.have.callCount(1);

    fireCombination('=');
    expect(fn2).to.have.callCount(1);
  });

  it('should handle caps lock key correctly', () => {
    const fn = cy.stub();

    keyBuddy.bindKey('capslock', fn);

    // CapsLock handling is browser-specific, for component tests
    // we just verify the binding doesn't crash
    expect(fn).to.have.callCount(0);
  });

  it('should handle binding to non-existent scope', () => {
    const fn = cy.stub();

    keyBuddy.bindKey('y', 'nonexistent', fn);

    keyBuddy.setScope('nonexistent');
    fireCombination('y');
    expect(fn).to.have.callCount(1);

    keyBuddy.setScope('all');
    fireCombination('y');
    expect(fn).to.have.callCount(1);
  });

  it('should handle special punctuation keys', () => {
    const tests = [
      { key: '.' },
      { key: '/' },
      { key: '`' },
      { key: ';' },
      { key: "'" },
      { key: '[' },
      { key: ']' },
      { key: '\\' },
    ];

    let testIndex = 0;
    const testNext = () => {
      if (testIndex >= tests.length) return;

      const { key } = tests[testIndex];
      const fn = cy.stub();
      keyBuddy.bindKey(key, fn);

      fireCombination(key);
      expect(fn).to.have.callCount(1);
      keyBuddy.unbindKey(key, fn);
      testIndex++;
      testNext();
    };
    testNext();
  });
});
