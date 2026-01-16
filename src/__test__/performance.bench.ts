import { bench, describe } from 'vitest';
import { createKeybuddy } from '../keybuddy';

const KEYS = 'abcdefghijklmnopqrstuvwxyz'.split('');

function createKeyboardEvent(
  key: string,
  options: Partial<KeyboardEventInit> = {},
): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
}

describe('Binding', () => {
  bench('bind 1000 shortcuts', () => {
    const keybuddy = createKeybuddy(document, () => true);
    const handler = () => {};
    for (let i = 0; i < 1000; i++) {
      keybuddy.bind(`ctrl+${KEYS[i % KEYS.length]}`, handler);
    }
    keybuddy.destroy();
  });
});

describe('Dispatching', () => {
  let keybuddy: ReturnType<typeof createKeybuddy>;
  let event: KeyboardEvent;

  bench(
    'dispatch with 100 bindings',
    () => {
      document.dispatchEvent(event);
    },
    {
      setup: () => {
        keybuddy = createKeybuddy(document, () => true);
        for (let i = 0; i < 100; i++) {
          keybuddy.bind(`ctrl+${KEYS[i % KEYS.length]}`, () => {});
        }
        event = createKeyboardEvent('a', { ctrlKey: true });
      },
      teardown: () => {
        keybuddy.destroy();
      },
    },
  );
});
