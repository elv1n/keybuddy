import { MODIFIERS, SPECIAL, ModifierKeys, Modifiers } from '../constants';

export interface ParsedShortcut {
  mods: Array<keyof ModifierKeys>;
  special: number[];
}
export interface KeyMap {
  code: number;
  shortcut: ParsedShortcut;
}

export const getKeyCode = (key: string): number =>
  SPECIAL[key] || key.toUpperCase().charCodeAt(0);

const getMods = (keys: string[]): ParsedShortcut =>
  keys.reduce(
    (acc, key) => {
      if ({}.hasOwnProperty.call(MODIFIERS, key)) {
        acc.mods.push(MODIFIERS[key as keyof Modifiers]);
      } else {
        acc.special.push(SPECIAL[key] || key.toUpperCase().charCodeAt(0));
      }
      return acc;
    },
    {
      mods: [],
      special: []
    } as ParsedShortcut
  );

const getCombinations = (keysStr: string): string[] => {
  const cleanKeys = keysStr.replace(/\s/g, '');
  const keys = cleanKeys.split(',');
  if (keys[keys.length - 1] === '') {
    keys[keys.length - 2] += ',';
  }

  return keys;
};

export const getKeyMap = (keysStr: string): KeyMap[] => {
  const keymap = getCombinations(keysStr);
  return keymap.map(keyCmd => {
    const keys = keyCmd.split('+');
    const key = keys[keys.length - 1];
    const code = getKeyCode(key);

    return {
      code,
      shortcut: getMods(keys)
    };
  });
};
