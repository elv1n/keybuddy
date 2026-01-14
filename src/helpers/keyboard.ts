import { KeyString, MODS, SPECIAL } from '../constants';

export const getKeyIdentifier = (key: string): KeyString => {
  return (SPECIAL[key] || key).toLowerCase() as KeyString;
};

const MODIFIER_KEYS: Record<string, true> = {
  shift: true,
  alt: true,
  control: true,
  meta: true,
};

export const isModifierKey = (key: string): boolean => key in MODIFIER_KEYS;

export const updateModifiers = (e: KeyboardEvent): number => {
  let modifiers = 0;
  if (e.shiftKey) modifiers |= MODS.SHIFT;
  if (e.altKey) modifiers |= MODS.ALT;
  if (e.ctrlKey) modifiers |= MODS.CTRL;
  if (e.metaKey) modifiers |= MODS.META;
  return modifiers;
};
