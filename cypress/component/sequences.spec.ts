import * as keyBuddy from '../../src';
import { fireCombination } from '../helpers';

describe('Sequence Shortcuts', () => {
  beforeEach(() => {
    cy.mount('<div data-testid="test-container">Test Component</div>');
  });

  afterEach(() => {
    keyBuddy.unbindAll();
  });

  describe('basic sequences', () => {
    it('should trigger sequence "g i" (g followed by i)', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('g i', fn);

      fireCombination('g');
      expect(fn).to.have.callCount(0);

      fireCombination('i');
      expect(fn).to.have.callCount(1);
    });

    it('should trigger sequence with modifier "cmd+k cmd+c"', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('cmd+k cmd+c', fn);

      fireCombination('cmd+k');
      expect(fn).to.have.callCount(0);

      fireCombination('cmd+c');
      expect(fn).to.have.callCount(1);
    });

    it('should trigger three-part sequence "g g i"', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('g g i', fn);

      fireCombination('g');
      expect(fn).to.have.callCount(0);

      fireCombination('g');
      expect(fn).to.have.callCount(0);

      fireCombination('i');
      expect(fn).to.have.callCount(1);
    });

    it('should trigger three-part sequence with modifiers "cmd+k cmd+s cmd+w"', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('cmd+k cmd+s cmd+w', fn);

      fireCombination('cmd+k');
      expect(fn).to.have.callCount(0);

      fireCombination('cmd+s');
      expect(fn).to.have.callCount(0);

      fireCombination('cmd+w');
      expect(fn).to.have.callCount(1);
    });
  });

  describe('sequence vs chord distinction', () => {
    it('should distinguish "cmd+z y" (sequence) from "cmd+z+y" (chord)', () => {
      const seqFn = cy.stub();
      const chordFn = cy.stub();

      keyBuddy.bindKey('cmd+z y', seqFn);
      keyBuddy.bindKey('cmd+z+y', chordFn);

      fireCombination('cmd+z+y');
      expect(chordFn).to.have.callCount(1);
      expect(seqFn).to.have.callCount(0);
      fireCombination('cmd+z');
      cy.wait(200);
      fireCombination('y');

      expect(chordFn).to.have.callCount(1);
      expect(seqFn).to.have.callCount(1);
    });

    it('should trigger sequence when keys are pressed separately', () => {
      const seqFn = cy.stub();
      const chordFn = cy.stub();

      keyBuddy.bindKey('cmd+z y', seqFn);
      keyBuddy.bindKey('cmd+z+y', chordFn);

      fireCombination('cmd+z');
      expect(seqFn).to.have.callCount(0);
      expect(chordFn).to.have.callCount(0);

      fireCombination('y');
      expect(seqFn).to.have.callCount(1);
      expect(chordFn).to.have.callCount(0);
    });
  });

  describe('sequence timeout', () => {
    it('should reset sequence after timeout', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('g i', fn);

      fireCombination('g');
      expect(fn).to.have.callCount(0);

      cy.wait(1100).then(() => {
        fireCombination('i');
        expect(fn).to.have.callCount(0);
      });
    });

    it('should work if completed within timeout', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('g i', fn);

      fireCombination('g');

      cy.wait(500).then(() => {
        fireCombination('i');
        expect(fn).to.have.callCount(1);
      });
    });
  });

  describe('sequence cancellation', () => {
    it('should cancel sequence on wrong key', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('g i', fn);

      fireCombination('g');
      expect(fn).to.have.callCount(0);

      fireCombination('x');
      expect(fn).to.have.callCount(0);

      fireCombination('i');
      expect(fn).to.have.callCount(0);
    });

    it('should allow restarting sequence after cancellation', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('g i', fn);

      fireCombination('g');
      fireCombination('x');

      fireCombination('g');
      fireCombination('i');
      expect(fn).to.have.callCount(1);
    });
  });

  describe('multiple sequences', () => {
    it('should support multiple different sequences', () => {
      const fn1 = cy.stub();
      const fn2 = cy.stub();

      keyBuddy.bindKey('g i', fn1);
      keyBuddy.bindKey('g o', fn2);

      fireCombination('g');
      fireCombination('i');
      expect(fn1).to.have.callCount(1);
      expect(fn2).to.have.callCount(0);

      fireCombination('g');
      fireCombination('o');
      expect(fn1).to.have.callCount(1);
      expect(fn2).to.have.callCount(1);
    });

    it('should handle overlapping sequence starts', () => {
      const fn1 = cy.stub();
      const fn2 = cy.stub();

      keyBuddy.bindKey('g i', fn1);
      keyBuddy.bindKey('g o', fn2);

      fireCombination('g');
      expect(fn1).to.have.callCount(0);
      expect(fn2).to.have.callCount(0);

      fireCombination('o');
      expect(fn1).to.have.callCount(0);
      expect(fn2).to.have.callCount(1);
    });
  });

  describe('unbinding sequences', () => {
    it('should unbind sequence correctly', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('g i', fn);

      fireCombination('g');
      fireCombination('i');
      expect(fn).to.have.callCount(1);

      keyBuddy.unbindKey('g i', fn);

      fireCombination('g');
      fireCombination('i');
      expect(fn).to.have.callCount(1);
    });
  });

  describe('sequence and standalone shortcut conflicts', () => {
    it('should NOT fire standalone shortcut when sequence completes on same key', () => {
      const seqFn = cy.stub();
      const standaloneFn = cy.stub();

      keyBuddy.bindKey('cmd+p cmd+k', seqFn);
      keyBuddy.bindKey('cmd+k', standaloneFn);

      fireCombination('cmd+p');
      expect(seqFn).to.have.callCount(0);
      expect(standaloneFn).to.have.callCount(0);

      fireCombination('cmd+k');
      expect(seqFn).to.have.callCount(1);
      expect(standaloneFn).to.have.callCount(0);
    });

    it('should fire standalone shortcut when sequence is not active', () => {
      const seqFn = cy.stub();
      const standaloneFn = cy.stub();

      keyBuddy.bindKey('cmd+p cmd+k', seqFn);
      keyBuddy.bindKey('cmd+k', standaloneFn);

      // Without starting the sequence, cmd+k should fire standalone
      fireCombination('cmd+k');
      expect(seqFn).to.have.callCount(0);
      expect(standaloneFn).to.have.callCount(1);
    });

    it('should handle sequence repeated multiple times without double-firing standalone', () => {
      const seqFn = cy.stub();
      const standaloneFn = cy.stub();

      keyBuddy.bindKey('cmd+p cmd+k', seqFn);
      keyBuddy.bindKey('cmd+k', standaloneFn);

      // First sequence
      fireCombination('cmd+p');
      fireCombination('cmd+k');
      expect(seqFn).to.have.callCount(1);
      expect(standaloneFn).to.have.callCount(0);

      // Second sequence
      fireCombination('cmd+p');
      fireCombination('cmd+k');
      expect(seqFn).to.have.callCount(2);
      expect(standaloneFn).to.have.callCount(0);

      // Standalone should still work when sequence not started
      fireCombination('cmd+k');
      expect(seqFn).to.have.callCount(2);
      expect(standaloneFn).to.have.callCount(1);
    });

    it('should NOT fire standalone on sequence START key when sequence exists', () => {
      const seqFn = cy.stub();
      const startKeyFn = cy.stub();

      keyBuddy.bindKey('cmd+p cmd+k', seqFn);
      keyBuddy.bindKey('cmd+p', startKeyFn);

      // Pressing cmd+p should NOT fire standalone because sequence might be starting
      fireCombination('cmd+p');
      expect(startKeyFn).to.have.callCount(0);
      expect(seqFn).to.have.callCount(0);

      // Completing the sequence should fire sequence handler
      fireCombination('cmd+k');
      expect(seqFn).to.have.callCount(1);
      expect(startKeyFn).to.have.callCount(0);
    });

    it('should NOT fire standalone cmd+k when sequence cmd+k e exists and is completed', () => {
      const seqFn = cy.stub();
      const standaloneFn = cy.stub();

      keyBuddy.bindKey('cmd+k e', seqFn);
      keyBuddy.bindKey('cmd+k', standaloneFn);

      // User does the full sequence: cmd+k followed by e
      fireCombination('cmd+k');
      // At this point, standalone should NOT fire because sequence might be in progress
      // This is the bug - currently standalone fires here

      fireCombination('e');
      // Sequence completes

      expect(seqFn).to.have.callCount(1);
      expect(standaloneFn).to.have.callCount(0); // This will likely FAIL - standalone fired on cmd+k
    });

    it('should NOT fire standalone shortcut when sequence completes (simple keys)', () => {
      const seqFn = cy.stub();
      const standaloneFn = cy.stub();

      keyBuddy.bindKey('g i', seqFn);
      keyBuddy.bindKey('i', standaloneFn);

      fireCombination('g');
      fireCombination('i');

      expect(seqFn).to.have.callCount(1);
      expect(standaloneFn).to.have.callCount(0);
    });
  });

  describe('space key', () => {
    it('should trigger sequence ending with space "g space"', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('g space', fn);

      fireCombination('g');
      expect(fn).to.have.callCount(0);

      fireCombination('space');
      expect(fn).to.have.callCount(1);
    });

    it('should trigger cmd+space shortcut', () => {
      const fn = cy.stub();

      keyBuddy.bindKey('cmd+space', fn);

      fireCombination('cmd+space');
      expect(fn).to.have.callCount(1);
    });
  });
});
