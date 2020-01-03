import { isFirefox } from './helpers/browser';

export const DEFAULT_SCOPE = 'all';

type ValueOf<T> = T[keyof T];

export type Modifiers = {
  '⇧': 16;
  shift: 16;
  '⌥': 18;
  alt: 18;
  option: 18;
  '⌃': 17;
  ctrl: 17;
  control: 17;
  '⌘': 91;
  command: 91;
};
export const MODIFIERS: Modifiers = {
  '⇧': 16,
  shift: 16,
  '⌥': 18,
  alt: 18,
  option: 18,
  '⌃': 17,
  ctrl: 17,
  control: 17,
  '⌘': 91,
  command: 91
};

export type ModifierMap = {
  [key in ValueOf<Modifiers>]: 'shiftKey' | 'altKey' | 'ctrlKey' | 'metaKey';
};
// export type ModifierMap = {
//   16: 'shiftKey';
//   18: 'altKey';
//   17: 'ctrlKey';
//   91: 'metaKey';
// };

export type ModifierKeys = Array<keyof ModifierMap>;

export const MODIFIERS_MAP: ModifierMap = {
  [MODIFIERS.shift]: 'shiftKey',
  [MODIFIERS.alt]: 'altKey',
  [MODIFIERS.ctrl]: 'ctrlKey',
  [MODIFIERS.command]: 'metaKey'
};

export const MODIFIERS_KEYS = Object.keys(MODIFIERS_MAP).map(i =>
  Number(i)
) as ModifierKeys;

// Special keys
export const SPECIAL: { [key: string]: number } = {
  backspace: 8,
  tab: 9,
  clear: 12,
  enter: 13,
  return: 13,
  esc: 27,
  escape: 27,
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  del: 46,
  delete: 46,
  home: 36,
  end: 35,
  pageup: 33,
  pagedown: 34,
  comma: 188,
  '.': 190,
  '/': 191,
  '`': 192,
  '-': isFirefox ? 173 : 189,
  '=': isFirefox ? 61 : 187,
  ';': 186,
  "'": 222,
  '[': 219,
  ']': 221,
  '\\': 220
};
export const CAPS_LOCK = 20;
