import { CAPS_LOCK_KEY, DEFAULT_SCOPE, KeyString } from './constants';
import { getKeyIdentifier, updateModifiers } from './helpers/keyboard';
import { getKeyMap, ParsedShortcut } from './helpers/keymap';
import { invariant, isEditable, isEqArray, isFirefox } from './helpers/utils';

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

// WeakMap to track event listener references per document to prevent memory leaks
const documentListeners = new WeakMap<
  Document,
  {
    dispatch: (e: KeyboardEvent) => void;
    cleanUp: (e: KeyboardEvent) => void;
    reset: () => void;
  }
>();

export function createKeybuddy(
  doc: Document,
  filterFn: FilterFn = defaultFilter,
) {
  let handlers: { [key: KeyString]: Handler[] } = {};
  const downKeys: Set<KeyString> = new Set();
  let activeScope = DEFAULT_SCOPE;

  let modifiers = 0; // Bitwise flag for active modifiers

  const bindKey = (
    keysStr: string,
    scopeOrMethod: string | noop,
    methodOrNull: noop = () => {},
    {
      skipOther,
    }: {
      skipOther: boolean;
    } = {
      skipOther: false,
    },
  ): void => {
    const scope: string =
      typeof scopeOrMethod === 'function' ? DEFAULT_SCOPE : scopeOrMethod;
    const method: noop =
      typeof scopeOrMethod === 'function' ? scopeOrMethod : methodOrNull;

    getKeyMap(keysStr).forEach(({ key, shortcut }) => {
      if (!handlers[key]) {
        handlers[key] = [];
      }
      const handler = handlers[key];
      if (process.env.NODE_ENV === 'development') {
        if (skipOther) {
          const action = handler.find((i) => i.skipOther);
          invariant(
            !action,
            "Conflicting 'skipOther' property with action",
            action,
          );
        }
      }

      handler.push({
        scope,
        method,
        shortcut,
        skipOther,
      });
    });
  };

  const unbindKeyProcess = (
    keysStr: string,
    deleteMethod: null | noop,
    deleteScope: string = DEFAULT_SCOPE,
  ): void => {
    getKeyMap(keysStr).forEach(({ key, shortcut }) => {
      const handler = handlers[key];
      if (Array.isArray(handler)) {
        const handler = handlers[key].filter(
          ({ scope, method, shortcut: methodShortcut }: Handler) =>
            !(
              scope === deleteScope &&
              methodShortcut.mods === shortcut.mods &&
              isEqArray(methodShortcut.special, shortcut.special) &&
              (deleteMethod === null ? true : method === deleteMethod)
            ),
        );
        if (handler.length) {
          handlers[key] = handler;
        } else {
          delete handlers[key];
        }
      }
    });
  };

  const unbindKey = (
    keysStr: string,
    scopeOrMethod: string | noop,
    methodOrNull: noop = () => {},
  ) => {
    const deleteScope: string =
      typeof scopeOrMethod === 'function' ? DEFAULT_SCOPE : scopeOrMethod;
    const deleteMethod: noop =
      typeof scopeOrMethod === 'function' ? scopeOrMethod : methodOrNull;
    return unbindKeyProcess(keysStr, deleteMethod, deleteScope);
  };

  const unsafeUnbindKey = (keysStr: string, scope?: string) =>
    unbindKeyProcess(keysStr, null, scope);

  const dispatch = (e: KeyboardEvent) => {
    const key = getKeyIdentifier(e.key);

    if (!filterFn(e)) {
      return;
    }

    // fix firefox behavior when caps lock fires three times onkeydown
    // and don't fire at all onkeyup (Firefox 72)
    if (isFirefox && key === CAPS_LOCK_KEY) {
      return;
    }

    modifiers = updateModifiers(e);

    // Check if key is not a modifier
    const isModifierKey =
      key === ('SHIFT' as KeyString) ||
      key === ('ALT' as KeyString) ||
      key === ('CTRL' as KeyString) ||
      key === ('META' as KeyString);
    if (!isModifierKey && !downKeys.has(key)) {
      downKeys.add(key);
    }
    // See if we need to ignore the keypress (filter() can can be overridden)
    // by default ignore key presses if a select, textarea, or input is focused
    // if (!assignKey.filter.call(this, event)) return;

    // abort if no potentially matching shortcuts found
    if (!(key in handlers)) {
      return;
    }

    const currentHandlers = handlers[key].filter(
      ({ scope, shortcut: { special, mods } }) => {
        if (scope !== activeScope) {
          return false;
        }

        return isEqArray(special, Array.from(downKeys)) && mods === modifiers;
      },
    );

    const primaryAction: Handler | undefined = currentHandlers.find(
      (action) => action.skipOther,
    );
    if (primaryAction) {
      primaryAction.method(e);
    } else {
      currentHandlers.forEach(({ method }) => {
        method(e);
      });
    }
  };

  const cleanUp = (e: KeyboardEvent) => {
    const key = getKeyIdentifier(e.key);

    // clean all for meta.
    // Main reason is ctrl+z (or any other native command not fires letter keyup on editable inputs)
    if (e.key && e.key.toLowerCase() === 'meta') {
      downKeys.clear();
    } else {
      downKeys.delete(key);
    }
  };

  const unbindScope = (deleteScope: string): void => {
    Object.keys(handlers).forEach((key) => {
      const keyString = key as KeyString;
      const handler = handlers[keyString].filter(
        ({ scope }: Handler) => scope !== deleteScope,
      );
      if (handler.length) {
        handlers[keyString] = handler;
      } else {
        delete handlers[keyString];
      }
    });
  };

  const setScope = (scope: string): void => {
    activeScope = scope;
  };

  const unbindAll = (): void => {
    handlers = {};
    downKeys.clear();
  };

  const reset = (): void => {
    downKeys.clear();
  };

  const destroy = (): void => {
    downKeys.clear();
    handlers = {};
    if (doc) {
      const listeners = documentListeners.get(doc);
      if (listeners) {
        doc.removeEventListener('keydown', listeners.dispatch);
        doc.removeEventListener('keyup', listeners.cleanUp);
        window.removeEventListener('focus', listeners.reset);
        documentListeners.delete(doc);
      }
    }
  };

  // Remove old listeners if they exist
  destroy();

  // Store and add new listeners
  documentListeners.set(doc, { dispatch, cleanUp, reset });
  doc.addEventListener('keydown', dispatch);
  doc.addEventListener('keyup', cleanUp);
  window.addEventListener('focus', reset);

  return {
    bind: bindKey,
    unbind: unbindKey,
    unsafeUnbind: unsafeUnbindKey,
    unbindScope,
    setScope,
    unbindAll,
    getScope: () => activeScope,
    destroy,
  };
}
