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
      ['alt+command+shift+z', 1],
    ];

    const commandToCypress = (str: string) =>
      str
        .split('+')
        .map((key) => {
          if (key in specials) {
            return `{${key}}`;
          }
          return key;
        })
        .join('');

    cy.onReady(({ bindKey, unbindKey }) => {
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
    const combinations = mods.reduce((acc, key) => {
      if (!usedMods.includes(key)) {
        const modsComb = [
          `${key}+e`,
          `${key}+e+w`,
          ...mods.map((modKey) => `${key}+${modKey}+e`),
          ...mods.map((modKey) => `${key}+${modKey}+e+w`),
        ];
        usedMods.push(key);
        acc.push(...modsComb);
        return acc;
      }
      return acc;
    }, [] as string[]);

    cy.onReady(({ bindKey }) => {
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
      ['control+s', 'control+alt+s'],
    ];
    const combinations = basic.concat(
      basic.map(([arg1, arg2]) => [arg2, arg1]),
    );

    cy.onReady(({ bindKey }) => {
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
  it('should test special', () => {
    const combinations = ['alt+left', 'alt+right'];

    cy.onReady(({ bindKey }) => {
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
  it('should call only skipOther', () => {
    cy.onReady(({ bindKey, unbindAll, DEFAULT_SCOPE }) => {
      const combination = 'alt+f';
      const cases = Array(3).fill(null);
      const testCase = (num: number): void => {
        if (num === 3) {
          return;
        }
        const stubs = cases.map(() => cy.stub());

        cases.forEach((_, index) => {
          bindKey(
            combination,
            DEFAULT_SCOPE,
            stubs[index],
            index === num ? { skipOther: true } : undefined,
          );
        });
        fireCombination(combination, () => {
          cases.forEach((_, index) => {
            expect(stubs[index]).to.have.callCount(num === index ? 1 : 0);
          });
          unbindAll();
          testCase(num + 1);
        });
      };
      testCase(0);
    });
  });
  it('should call all without skipOther', () => {
    cy.onReady(({ bindKey, DEFAULT_SCOPE }) => {
      const combination = 'alt+f';
      const fn1 = cy.stub();
      const fn2 = cy.stub();
      const fn3 = cy.stub();
      bindKey(combination, DEFAULT_SCOPE, fn1);
      bindKey(combination, DEFAULT_SCOPE, fn2);
      bindKey(combination, DEFAULT_SCOPE, fn3);
      fireCombination(combination, () => {
        expect(fn1).to.be.calledOnce;
        expect(fn2).to.be.calledOnce;
        expect(fn3).to.be.calledOnce;
      });
    });
  });
});
