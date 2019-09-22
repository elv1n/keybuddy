import { Modifiers, MODIFIERS, MODIFIERS_MAP } from '../../src/constants';
import { getKeyCode } from '../../src/helpers/keymap';

import { specials } from '../constants';
import { fireCombination } from '../helpers';

const type = (string: string) => cy.get('body').type(string);

// eslint-disable-next-line no-undef
context('Test browser bindings', () => {
  beforeEach(() => {
    cy.visit('public/index.html');
  });
  it('should test with modifiers', () => {
    const globalCases: [string, number][] = [
      ['command+z', 1],
      ['e', 1],
      ['z', 1],
      ['alt+p', 1],
      ['shift+t', 1],
      ['command+shift+z', 1],
      ['alt+command+shift+z', 1]
    ];

    const commandToCypress = (str: string) =>
      str
        .split('+')
        .map(key => {
          if ({}.hasOwnProperty.call(specials, key)) {
            return `{${key}}`;
          }
          return key;
        })
        .join('');

    cy.window().then(({ keybuddy: { bindKey, unbindKey } }) => {
      const testCase = (num: number) => {
        if (num === globalCases.length - 1) {
          return;
        }
        const [command, callCount] = globalCases[num];
        const fn = cy.stub();
        bindKey(command, fn);

        type(commandToCypress(command)).then(() => {
          expect(fn).to.have.callCount(callCount);
          unbindKey(command, fn);
          testCase(num + 1);
        });
      };
      testCase(0);
    });
  });

  it('should test combinations', () => {
    const mods = ['shift', 'alt', 'control', 'command'];
    const usedMods: string[] = [];
    const combinations = mods.reduce(
      (acc, key) => {
        if (!usedMods.includes(key)) {
          const modsComb = [
            `${key}+e`,
            `${key}+e+w`,
            ...mods.map(modKey => `${key}+${modKey}+e`),
            ...mods.map(modKey => `${key}+${modKey}+e+w`)
          ];
          usedMods.push(key);
          return [...acc, ...modsComb];
        }
        return acc;
      },
      [] as string[]
    );

    cy.window().then(({ keybuddy: { bindKey, unbindKey } }) => {
      const testCase = (num: number): void => {
        const combination = combinations[num];
        if (!combination) {
          return;
        }

        const fn = cy.stub();
        bindKey(combination, fn);
        fireCombination(combination, () => {
          expect(fn).to.have.callCount(1);
          testCase(num + 1);
        });
      };
      testCase(0);
    });
  });
  it('should not fire on different modes', () => {
    const basic = [
      ['shift+s', 'control+shift+s'],
      ['shift+s', 'alt+shift+s'],
      ['shift+s', 'command+shift+s'],
      ['alt+s', 'alt+command+s'],
      ['alt+s', 'alt+control+s'],
      ['command+s', 'control+command+s'],
      ['control+s', 'control+alt+s']
    ];
    const combinations = basic.concat(
      basic.map(([arg1, arg2]) => [arg2, arg1])
    );

    cy.window().then(({ keybuddy: { bindKey, unbindKey } }) => {
      const testCase = (num: number): void => {
        const combination = combinations[num];
        if (!combination) {
          return;
        }
        const [original, fired] = combination;

        const fn = cy.stub();
        bindKey(original, fn);
        fireCombination(fired, () => {
          expect(fn).to.have.callCount(0);
          testCase(num + 1);
        });
      };
      testCase(0);
    });
  });
});
