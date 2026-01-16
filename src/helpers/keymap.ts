import { KeyString, MODIFIERS, ModifierNames, SPECIAL } from '../constants';
import { getKeyIdentifier } from './keyboard';

export interface ParsedShortcut {
  mods: number;
  special: string[];
}

export interface KeyMap {
  key: KeyString;
  shortcut: ParsedShortcut;
  sequence?: KeyMap[];
}

const getMods = (keys: string[]): ParsedShortcut =>
  keys.reduce(
    (acc, key) => {
      if (key in MODIFIERS) {
        acc.mods |= MODIFIERS[key as keyof ModifierNames];
      } else {
        acc.special.push((SPECIAL[key] || key).toLowerCase());
      }
      return acc;
    },
    {
      mods: 0,
      special: [],
    } as ParsedShortcut,
  );

function parseCombo(combo: string): KeyMap {
  const keys = combo.split('+');
  const key = keys[keys.length - 1];
  const keyIdentifier = getKeyIdentifier(key);

  return {
    key: keyIdentifier,
    shortcut: getMods(keys),
  };
}

export const getKeyMap = (keysStr: string): KeyMap => {
  const parts = keysStr.trim().split(/\s+/);

  if (parts.length === 1) {
    return parseCombo(parts[0]);
  }

  const first = parseCombo(parts[0]);
  first.sequence = parts.slice(1).map(parseCombo);
  return first;
};
