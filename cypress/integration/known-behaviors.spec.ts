describe.skip('Known Behaviors - Document Expected Functionality', () => {
  beforeEach(() => {
    cy.visit('public/index.html');
  });

  it('should clear all downKeys when meta key is released', () => {
    cy.onReady(({ bindKey }) => {
      const fn = cy.stub();

      bindKey('cmd+z+x', fn);

      cy.get('body')
        .trigger('keydown', { keyCode: 91, key: 'Meta' })
        .trigger('keydown', { keyCode: 90, key: 'z' })
        .trigger('keydown', { keyCode: 88, key: 'x' })
        .then(() => {
          expect(fn).to.have.callCount(1);
        });

      cy.get('body')
        .trigger('keyup', { keyCode: 91, key: 'Meta' })
        .trigger('keydown', { keyCode: 88, key: 'x' })
        .then(() => {
          // After meta key is released, downKeys should be cleared
          // so pressing 'x' alone should not trigger the combination
          expect(fn).to.have.callCount(1);
        });
    });
  });

  it('should handle sequence binding like "cmd+z y" (cmd+z followed by y)', () => {
    cy.onReady(({ bindKey }) => {
      const fn = cy.stub();

      // This tests a sequence: cmd+z followed by y (not cmd+z+y)
      bindKey('cmd+z y', fn);

      // First press cmd+z
      cy.get('body')
        .trigger('keydown', { keyCode: 91, key: 'Meta', metaKey: true })
        .trigger('keydown', { keyCode: 90, key: 'z', metaKey: true })
        .trigger('keyup', { keyCode: 90, key: 'z', metaKey: true })
        .trigger('keyup', { keyCode: 91, key: 'Meta' })
        .then(() => {
          // At this point, cmd+z has been pressed and released
          expect(fn).to.have.callCount(0);
        });

      // Then press y separately
      cy.get('body')
        .trigger('keydown', { keyCode: 89, key: 'y' })
        .trigger('keyup', { keyCode: 89, key: 'y' })
        .then(() => {
          // This should trigger the sequence
          expect(fn).to.have.callCount(1);
        });
    });
  });

  it('should NOT clear downKeys for sequence bindings when meta is still held', () => {
    cy.onReady(({ bindKey }) => {
      const fn = cy.stub();

      // Binding a sequence where meta is held throughout
      bindKey('cmd+z+y', fn);

      cy.get('body')
        .trigger('keydown', { keyCode: 91, key: 'Meta', metaKey: true })
        .trigger('keydown', { keyCode: 90, key: 'z', metaKey: true })
        .then(() => {
          // Meta and Z are down, but combination not complete yet
          expect(fn).to.have.callCount(0);
        });

      // Press Y while still holding meta
      cy.get('body')
        .trigger('keydown', { keyCode: 89, key: 'y', metaKey: true })
        .then(() => {
          // Now the full combination should trigger
          expect(fn).to.have.callCount(1);
        });

      // Release all keys
      cy.get('body')
        .trigger('keyup', { keyCode: 89, key: 'y' })
        .trigger('keyup', { keyCode: 90, key: 'z' })
        .trigger('keyup', { keyCode: 91, key: 'Meta' })
        .then(() => {
          // No additional triggers
          expect(fn).to.have.callCount(1);
        });
    });
  });

  it('should differentiate between "cmd+z y" (sequence) and "cmd+z+y" (combination)', () => {
    cy.onReady(({ bindKey }) => {
      const seqFn = cy.stub();
      const comboFn = cy.stub();

      // Sequence: cmd+z then y
      bindKey('cmd+z y', seqFn);
      // Combination: cmd+z+y all together
      bindKey('cmd+z+y', comboFn);

      // Test combination first (all keys together)
      cy.get('body')
        .trigger('keydown', { keyCode: 91, key: 'Meta', metaKey: true })
        .trigger('keydown', { keyCode: 90, key: 'z', metaKey: true })
        .trigger('keydown', { keyCode: 89, key: 'y', metaKey: true })
        .then(() => {
          expect(comboFn).to.have.callCount(1);
          expect(seqFn).to.have.callCount(0);
        });

      // Release all keys
      cy.get('body')
        .trigger('keyup', { keyCode: 89, key: 'y' })
        .trigger('keyup', { keyCode: 90, key: 'z' })
        .trigger('keyup', { keyCode: 91, key: 'Meta' });

      // Test sequence (cmd+z, release, then y)
      cy.get('body')
        .trigger('keydown', { keyCode: 91, key: 'Meta', metaKey: true })
        .trigger('keydown', { keyCode: 90, key: 'z', metaKey: true })
        .trigger('keyup', { keyCode: 90, key: 'z' })
        .trigger('keyup', { keyCode: 91, key: 'Meta' })
        .trigger('keydown', { keyCode: 89, key: 'y' })
        .then(() => {
          expect(seqFn).to.have.callCount(1);
          expect(comboFn).to.have.callCount(1); // Still 1 from before
        });
    });
  });

  it('should maintain downKeys state correctly during normal operation', () => {
    cy.onReady(({ bindKey }) => {
      const fn = cy.stub();

      bindKey('a+b+c', fn);

      // Press keys in sequence
      cy.get('body')
        .trigger('keydown', { keyCode: 65, key: 'a' })
        .trigger('keydown', { keyCode: 66, key: 'b' })
        .trigger('keydown', { keyCode: 67, key: 'c' })
        .then(() => {
          expect(fn).to.have.callCount(1);
        });

      // Release one key
      cy.get('body')
        .trigger('keyup', { keyCode: 66, key: 'b' })
        .then(() => {
          // No additional trigger
          expect(fn).to.have.callCount(1);
        });

      // Press C again while A is still down - should not trigger
      cy.get('body')
        .trigger('keydown', { keyCode: 67, key: 'c' })
        .then(() => {
          expect(fn).to.have.callCount(1);
        });
    });
  });

  it('should handle window focus reset correctly', () => {
    cy.onReady(({ bindKey }) => {
      const fn = cy.stub();

      bindKey('ctrl+f+g', fn);

      cy.get('body')
        .trigger('keydown', { keyCode: 17, ctrlKey: true })
        .trigger('keydown', { keyCode: 70, ctrlKey: true });

      cy.window().blur();
      cy.window().focus();

      cy.get('body')
        .trigger('keydown', { keyCode: 71, ctrlKey: true })
        .then(() => {
          expect(fn).to.have.callCount(0);
        });
    });
  });

  describe.skip('should not trigger on elements by default', () => {
    it('should not trigger on textarea elements by default', () => {
      cy.onReady(({ bindKey }) => {
        const fn = cy.stub();

        bindKey('t', fn);

        cy.get('body').then(($body) =>
          $body.append('<textarea id="test-textarea"></textarea>'),
        );
        cy.get('#test-textarea')
          .focus()
          .type('t')
          .then(() => {
            expect(fn).to.have.callCount(0);
          });
      });
    });
    it('should not trigger on contenteditable elements by default', () => {
      cy.onReady(({ bindKey }) => {
        const fn = cy.stub();

        bindKey('c', fn);

        cy.get('body').then(($body) =>
          $body.append('<div id="test-editable" contenteditable="true"></div>'),
        );
        cy.get('#test-editable')
          .focus()
          .type('c')
          .then(() => {
            expect(fn).to.have.callCount(0);
          });
      });
    });

    it('should not trigger on select elements by default', () => {
      cy.onReady(({ bindKey }) => {
        const fn = cy.stub();

        bindKey('s', fn);

        cy.get('body').then(($body) =>
          $body.append(
            '<select id="test-select"><option>Test</option></select>',
          ),
        );
        cy.get('#test-select')
          .focus()
          .type('s')
          .then(() => {
            expect(fn).to.have.callCount(0);
          });
      });
    });

    it('should not trigger on input elements by default', () => {
      cy.onReady(({ bindKey }) => {
        const fn = cy.stub();

        bindKey('e', fn);

        cy.get('body').then(($body) =>
          $body.append('<input id="test-input" />'),
        );
        cy.get('#test-input')
          .focus()
          .type('e')
          .then(() => {
            expect(fn).to.have.callCount(0);
          });

        cy.get('body')
          .click()
          .type('e')
          .then(() => {
            expect(fn).to.have.callCount(1);
          });
      });
    });
  });
});
