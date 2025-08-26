export const specials = [
  '{',
  'backspace',
  'del',
  'downarrow',
  'end',
  'enter',
  'esc',
  'home',
  'insert',
  'leftarrow',
  'pagedown',
  'pageup',
  'rightarrow',
  'selectall',
  'uparrow',
  'alt',
  'option',
  'command',
  'cmd',
  'control',
  'ctrl',
  'meta',
  'shift',
].reduce(
  (acc, key) => {
    acc[key] = true;
    return acc;
  },
  {} as { [key: string]: boolean },
);
