import { Modifiers, MODIFIERS, MODIFIERS_MAP } from '../src/constants';
import { getKeyCode } from '../src/helpers/keymap';

interface Events {
  mods: {
    [key: string]: boolean;
  };
  keys: {
    key: string;
    keyCode: number;
  }[];
}

export const fireCombination = (
  combination: string,
  callback: () => void
): void => {
  const events: Events = combination.split('+').reduce(
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

  const keyUp = () => {
    events.keys.forEach((key, index) => {
      cy.document()
        .trigger('keyup', {
          ...key,
          ...events.mods
        })
        .then(() => {
          if (index === events.keys.length - 1) {
            callback();
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
          keyUp();
        }
      });
  });
};
