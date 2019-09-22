import { Modifiers, MODIFIERS, MODIFIERS_MAP } from '../../src/constants';
import { getKeyCode } from '../../src/helpers/keymap';

import { specials } from '../constants';

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
    interface Events {
      mods: {
        [key: string]: boolean;
      };
      keys: {
        key: string;
        keyCode: number;
      }[];
    }
    cy.window().then(({ keybuddy: { bindKey, unbindKey } }) => {
      const testCase = (num: number) => {
        const combination = combinations[num];
        if (!combination) {
          return;
        }

        const events = combination.split('+').reduce(
          (acc, key) => {
            if ({}.hasOwnProperty.call(MODIFIERS, key)) {
              const modKey = MODIFIERS_MAP[MODIFIERS[key as keyof Modifiers]];
              acc.mods[modKey] = true;
            } else {
              acc.keys.push({
                key,
                keyCode: getKeyCode(key)
              });
            }
            return acc;
          },
          {
            mods: {},
            keys: []
          } as Events
        );
        const fn = cy.stub();
        bindKey(combination, fn);

        const keyUp = () => {
          events.keys.forEach((key, index) => {
            cy.document()
              .trigger('keyup', {
                ...key,
                ...events.mods
              })
              .then(() => {
                if (index === events.keys.length - 1) {
                  unbindKey(combination, fn);
                  testCase(num + 1);
                }
              });
          });
        };

        events.keys.forEach((key, index) => {
          cy.document()
            .trigger('keydown', {
              ...key,
              ...events.mods
            })
            .then(() => {
              if (index === events.keys.length - 1) {
                expect(fn).to.have.callCount(1);
                keyUp();
              }
            });
        });
      };
      testCase(0);
    });
  });
});
