export const DEFAULT_SCOPE = 'all';

declare const KeyStringBrand: unique symbol;

export type KeyString = string & { readonly [KeyStringBrand]: true };

export const MODS = {
  SHIFT: 0b0001, // 1
  ALT: 0b0010, // 2
  CTRL: 0b0100, // 4
  META: 0b1000, // 8
} as const;

// Map string modifier names to bitwise flags for parsing
export type ModifierNames = {
  '⇧': number;
  shift: number;
  '⌥': number;
  alt: number;
  option: number;
  '⌃': number;
  ctrl: number;
  control: number;
  '⌘': number;
  cmd: number;
  command: number;
};

export const MODIFIERS: ModifierNames = {
  '⇧': MODS.SHIFT,
  shift: MODS.SHIFT,
  '⌥': MODS.ALT,
  alt: MODS.ALT,
  option: MODS.ALT,
  '⌃': MODS.CTRL,
  ctrl: MODS.CTRL,
  control: MODS.CTRL,
  '⌘': MODS.META,
  cmd: MODS.META,
  command: MODS.META,
};

export const SPECIAL: { [key: string]: string } = {
  backspace: 'Backspace',
  tab: 'Tab',
  clear: 'Clear',
  enter: 'Enter',
  return: 'Enter',
  esc: 'Escape',
  escape: 'Escape',
  space: ' ',
  left: 'ArrowLeft',
  up: 'ArrowUp',
  right: 'ArrowRight',
  down: 'ArrowDown',
  del: 'Delete',
  delete: 'Delete',
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  comma: ',',
  '.': '.',
  '/': '/',
  '`': '`',
  '-': '-',
  '=': '=',
  ';': ';',
  "'": "'",
  '[': '[',
  ']': ']',
  '\\': '\\',
  // Normalize Meta key variants
  Meta: 'Meta',
  MetaLeft: 'Meta',
  MetaRight: 'Meta',
  OS: 'Meta', // Some browsers use OS instead of Meta
  ContextMenu: 'Meta', // Right-click context menu key sometimes acts as Meta
  // Add identity mappings for already-normalized keys
  ArrowLeft: 'ArrowLeft',
  ArrowUp: 'ArrowUp',
  ArrowRight: 'ArrowRight',
  ArrowDown: 'ArrowDown',
  Backspace: 'Backspace',
  Tab: 'Tab',
  Clear: 'Clear',
  Enter: 'Enter',
  Escape: 'Escape',
  Delete: 'Delete',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
};

export const CAPS_LOCK_KEY = 'CapsLock';
