import { KeyString, MODIFIERS, MODS, ModifierNames } from '../src/constants';
import { getKeyIdentifier } from '../src/helpers/keymap';

interface Events {
  mods: {
    [key: string]: boolean;
  };
  keys: KeyString[];
}

export const fireCombination = (combination: string): void => {
  const events: Events = combination.split('+').reduce(
    (acc, key) => {
      if (key in MODIFIERS) {
        const modValue = MODIFIERS[key as keyof ModifierNames];
        // Map bitwise flags to keyboard event properties
        if (modValue & MODS.SHIFT) acc.mods.shiftKey = true;
        if (modValue & MODS.ALT) acc.mods.altKey = true;
        if (modValue & MODS.CTRL) acc.mods.ctrlKey = true;
        if (modValue & MODS.META) acc.mods.metaKey = true;
      } else {
        acc.keys.push(getKeyIdentifier(key));
      }
      return acc;
    },
    {
      mods: {},
      keys: [],
    } as Events,
  );

  // If no regular keys, just return
  if (events.keys.length === 0) {
    return;
  }

  // Fire events synchronously
  events.keys.forEach((key) => {
    const keydownEvent = new KeyboardEvent('keydown', {
      key,
      code:
        key.startsWith('Arrow') ||
        [
          'Backspace',
          'Tab',
          'Enter',
          'Escape',
          'Delete',
          'Home',
          'End',
          'PageUp',
          'PageDown',
        ].includes(key)
          ? key
          : `Key${key.toUpperCase()}`,
      bubbles: true,
      cancelable: true,
      ctrlKey: events.mods.ctrlKey || false,
      altKey: events.mods.altKey || false,
      shiftKey: events.mods.shiftKey || false,
      metaKey: events.mods.metaKey || false,
    });

    // Override readonly properties for better compatibility
    Object.defineProperties(keydownEvent, {
      target: {
        value: document.querySelector('[data-testid="test-container"]'),
        writable: false,
      },
    });

    document.dispatchEvent(keydownEvent);
  });

  // Fire all keyup events in reverse order
  [...events.keys].reverse().forEach((key) => {
    const keyupEvent = new KeyboardEvent('keyup', {
      key,
      code:
        key.startsWith('Arrow') ||
        [
          'Backspace',
          'Tab',
          'Enter',
          'Escape',
          'Delete',
          'Home',
          'End',
          'PageUp',
          'PageDown',
        ].includes(key)
          ? key
          : `Key${key.toUpperCase()}`,
      bubbles: true,
      cancelable: true,
      ctrlKey: events.mods.ctrlKey || false,
      altKey: events.mods.altKey || false,
      shiftKey: events.mods.shiftKey || false,
      metaKey: events.mods.metaKey || false,
    });

    // Override readonly properties for better compatibility
    Object.defineProperties(keyupEvent, {
      target: {
        value: document.querySelector('[data-testid="test-container"]'),
        writable: false,
      },
    });

    // Dispatch to document directly
    document.dispatchEvent(keyupEvent);
  });
};
