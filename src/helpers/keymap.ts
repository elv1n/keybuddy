import { KeyString, MODIFIERS, ModifierNames, SPECIAL } from '../constants';
import { getKeyIdentifier } from './keyboard';

export interface ParsedShortcut {
  mods: number; // Bitwise flag for modifiers
  special: string[];
}
export interface KeyMap {
  key: KeyString;
  shortcut: ParsedShortcut;
}

const getMods = (keys: string[]): ParsedShortcut =>
  keys.reduce(
    (acc, key) => {
      if (key in MODIFIERS) {
        acc.mods |= MODIFIERS[key as keyof ModifierNames];
      } else {
        acc.special.push(SPECIAL[key] || key.toUpperCase());
      }
      return acc;
    },
    {
      mods: 0, // Start with no modifiers
      special: [],
    } as ParsedShortcut,
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
  return keymap.map((keyCmd) => {
    const keys = keyCmd.split('+');
    const key = keys[keys.length - 1];
    const keyIdentifier = getKeyIdentifier(key);

    return {
      key: keyIdentifier,
      shortcut: getMods(keys),
    };
  });
};
