import invariant from 'invariant';
import {
  DEFAULT_SCOPE,
  MODIFIERS_KEYS,
  MODIFIERS_MAP,
  ModifierMap,
  ModifierKeys
} from './constants';
import { getKeyMap, ParsedShortcut } from './helpers/keymap';
import { isEqArray, isBoolArrayToObject } from './helpers/data';
import { isEditable } from './helpers/browser';

type noop = (e: KeyboardEvent) => void;
type FilterFn = (el: KeyboardEvent) => boolean;

interface Handler {
  scope: string;
  method: noop;
  shortcut: ParsedShortcut;
  skipOther: boolean;
}

const defaultFilter = (e: KeyboardEvent): boolean =>
  e && !isEditable(e.target as HTMLElement);

type Mods = {
  [key in keyof ModifierMap]: boolean;
};

export default (doc?: HTMLDocument, filterFn: FilterFn = defaultFilter) => {
  let handlers: { [key: string]: Handler[] } = {};
  let downKeys: number[] = [];
  let activeScope = DEFAULT_SCOPE;

  const modifiers: Mods = MODIFIERS_KEYS.reduce(
    (acc, key) => {
      acc[key] = false;
      return acc;
    },
    {} as Mods
  );
  const modsKeys = Object.keys(modifiers).map(i => Number(i)) as ModifierKeys;

  const updateModifiers = (e: KeyboardEvent): void => {
    modsKeys.forEach(key => {
      modifiers[key] = e[MODIFIERS_MAP[key]];
    });
  };

  const bindKey = (
    keysStr: string,
    scopeOrMethod: string | noop,
    methodOrNull: noop = () => {},
    {
      skipOther
    }: {
      skipOther: boolean;
    } = {
      skipOther: false
    }
  ): void => {
    const scope: string =
      typeof scopeOrMethod === 'function' ? DEFAULT_SCOPE : scopeOrMethod;
    const method: noop =
      typeof scopeOrMethod === 'function' ? scopeOrMethod : methodOrNull;

    getKeyMap(keysStr).forEach(({ code, shortcut }) => {
      if (!handlers[code]) {
        handlers[code] = [];
      }
      const handler = handlers[code];
      console.log(process.env.NODE_ENV);
      if (process.env.NODE_ENV === 'development') {
        if (skipOther) {
          const action = handler.find(i => i.skipOther);
          console.log(action);
          invariant(
            Boolean(action),
            "Conflicting 'skipOther' property with action",
            action
          );
        }
      }

      handler.push({
        scope,
        method,
        shortcut,
        skipOther
      });
    });
  };

  const unbindKeyProcess = (
    keysStr: string,
    deleteMethod: null | noop,
    deleteScope: string = DEFAULT_SCOPE
  ): void => {
    getKeyMap(keysStr).forEach(({ code, shortcut }) => {
      const handler = handlers[code];
      if (Array.isArray(handler)) {
        const handler = handlers[code].filter(
          ({ scope, method, shortcut: methodShortcut }: Handler) =>
            !(
              scope === deleteScope &&
              isEqArray(methodShortcut.mods, shortcut.mods) &&
              isEqArray(methodShortcut.special, shortcut.special) &&
              (deleteMethod === null ? true : method === deleteMethod)
            )
        );
        if (handler.length) {
          handlers[code] = handler;
        } else {
          delete handlers[code];
        }
      }
    });
  };

  const unbindKey = (
    keysStr: string,
    scopeOrMethod: string | noop,
    methodOrNull: noop = () => {}
  ) => {
    const deleteScope: string =
      typeof scopeOrMethod === 'function' ? DEFAULT_SCOPE : scopeOrMethod;
    const deleteMethod: noop =
      typeof scopeOrMethod === 'function' ? scopeOrMethod : methodOrNull;
    return unbindKeyProcess(keysStr, deleteMethod, deleteScope);
  };

  const unsafeUnbindKey = (keysStr: string, scope?: string) =>
    unbindKeyProcess(keysStr, null, scope);

  const fixedKey = (keyCode: number): number => {
    if (keyCode === 93 || keyCode === 224) {
      return 91;
    }
    return keyCode;
  };

  const dispatch = (e: KeyboardEvent) => {
    const { keyCode } = e;
    const key = fixedKey(keyCode);

    if (!filterFn(e)) {
      return;
    }

    updateModifiers(e);

    if (!{}.hasOwnProperty.call(modifiers, key) && !downKeys.includes(key)) {
      downKeys.push(key);
    }
    // See if we need to ignore the keypress (filter() can can be overridden)
    // by default ignore key presses if a select, textarea, or input is focused
    // if (!assignKey.filter.call(this, event)) return;

    // abort if no potentially matching shortcuts found
    if (!(key in handlers)) {
      return;
    }

    handlers[key]
      .filter(({ scope, shortcut: { special, mods } }) => {
        if (scope !== activeScope) {
          return false;
        }

        return (
          isEqArray(special, downKeys) && isBoolArrayToObject(mods, modifiers)
        );
      })
      .map(({ method }: Handler) => method(e));
  };

  const cleanUp = (e: KeyboardEvent) => {
    const { keyCode } = e;
    const key = fixedKey(keyCode);

    downKeys = downKeys.filter(i => i !== key);
  };

  const unbindScope = (deleteScope: string): void => {
    Object.keys(handlers).forEach(keyCode => {
      const handler = handlers[keyCode].filter(
        ({ scope }: Handler) => scope !== deleteScope
      );
      if (handler.length) {
        handlers[keyCode] = handler;
      } else {
        delete handlers[keyCode];
      }
    });
  };

  const setScope = (scope: string): void => {
    activeScope = scope;
  };

  const unbindAll = (): void => {
    handlers = {};
  };

  const reset = (): void => {
    downKeys = [];
  };

  const destroy = (): void => {
    downKeys = [];
    handlers = {};
    if (doc) {
      doc.removeEventListener('keydown', dispatch);
      doc.removeEventListener('keyup', cleanUp);
      // Reset all on window focus
      window.removeEventListener('focus', reset);
    }
  };

  if (doc) {
    doc.addEventListener('keydown', dispatch);
    doc.addEventListener('keyup', cleanUp);
    // Reset all on window focus
    window.addEventListener('focus', reset);
  }

  return {
    bind: bindKey,
    unbind: unbindKey,
    unsafeUnbind: unsafeUnbindKey,
    unbindScope,
    setScope,
    unbindAll,
    getScope: () => activeScope,
    destroy
  };
};
