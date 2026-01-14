import { CAPS_LOCK_KEY, DEFAULT_SCOPE, KeyString, MODS } from './constants';
import {
  getKeyIdentifier,
  isModifierKey,
  updateModifiers,
} from './helpers/keyboard';
import { getKeyMap, ParsedShortcut } from './helpers/keymap';
import { invariant, isEditable, isEqArray, isFirefox } from './helpers/utils';

type KeyHandler = (e: KeyboardEvent) => void;
type FilterFn = (el: KeyboardEvent) => boolean;

interface Handler {
  scope: string;
  method: KeyHandler;
  shortcut: ParsedShortcut;
  skipOther: boolean;
}

const defaultFilter = (e: KeyboardEvent): boolean =>
  e && !isEditable(e.target as HTMLElement);

const documentListeners = new WeakMap<
  Document,
  {
    dispatch: (e: KeyboardEvent) => void;
    cleanUp: (e: KeyboardEvent) => void;
    reset: () => void;
    window: Window & typeof globalThis;
  }
>();

export function createKeybuddy(
  doc: Document,
  filterFn: FilterFn = defaultFilter,
) {
  let handlers: { [key: KeyString]: Handler[] } = {};
  const downKeys: Set<KeyString> = new Set();
  let activeScope = DEFAULT_SCOPE;

  let modifiers = 0;

  const bindKey = (
    keysStr: string,
    scopeOrMethod: string | KeyHandler,
    methodOrNull: KeyHandler = () => {},
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
    const method: KeyHandler =
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
    deleteMethod: null | KeyHandler,
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
    scopeOrMethod: string | KeyHandler,
    methodOrNull: KeyHandler = () => {},
  ) => {
    const deleteScope: string =
      typeof scopeOrMethod === 'function' ? DEFAULT_SCOPE : scopeOrMethod;
    const deleteMethod: KeyHandler =
      typeof scopeOrMethod === 'function' ? scopeOrMethod : methodOrNull;
    unbindKeyProcess(keysStr, deleteMethod, deleteScope);
  };

  const unsafeUnbindKey = (keysStr: string, scope?: string) =>
    unbindKeyProcess(keysStr, null, scope);

  const dispatch = (e: KeyboardEvent) => {
    const key = getKeyIdentifier(e.key);

    if (!filterFn(e)) {
      return;
    }

    if (isFirefox && key === CAPS_LOCK_KEY) {
      return;
    }

    modifiers = updateModifiers(e);

    const isModifier = isModifierKey(key);
    if (!isModifier && !downKeys.has(key)) {
      downKeys.add(key);
    }

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
        listeners.window.removeEventListener('focus', listeners.reset);
        documentListeners.delete(doc);
      }
    }
  };

  const win = (doc.defaultView || window) as Window & typeof globalThis;

  documentListeners.set(doc, { dispatch, cleanUp, reset, window: win });
  doc.addEventListener('keydown', dispatch);
  doc.addEventListener('keyup', cleanUp);
  win.addEventListener('focus', reset);

  const getScope = () => activeScope;

  const isBound = (keysStr: string, options?: { scope?: string }): boolean => {
    const scope = options?.scope || activeScope;
    const keyMaps = getKeyMap(keysStr);

    return keyMaps.some(({ key, shortcut }) => {
      const keyHandlers = handlers[key];
      if (!keyHandlers) return false;

      return keyHandlers.some(
        (h) =>
          h.scope === scope &&
          h.shortcut.mods === shortcut.mods &&
          isEqArray(h.shortcut.special, shortcut.special),
      );
    });
  };

  const getBoundKeys = (options?: { scope?: string }): string[] => {
    const scope = options?.scope || activeScope;
    const keys = new Set<string>();

    Object.values(handlers).forEach((handlerList) => {
      handlerList.forEach((handler) => {
        if (handler.scope === scope) {
          const modParts: string[] = [];
          if (handler.shortcut.mods & MODS.CTRL) modParts.push('ctrl');
          if (handler.shortcut.mods & MODS.ALT) modParts.push('alt');
          if (handler.shortcut.mods & MODS.SHIFT) modParts.push('shift');
          if (handler.shortcut.mods & MODS.META) modParts.push('cmd');

          const keyPart = handler.shortcut.special.join('+') || '';
          const fullKey = [...modParts, keyPart].filter(Boolean).join('+');
          if (fullKey) keys.add(fullKey);
        }
      });
    });

    return Array.from(keys);
  };

  const getHandlers = (
    keysStr: string,
    options?: { scope?: string },
  ): KeyHandler[] => {
    const scope = options?.scope || activeScope;
    const keyMaps = getKeyMap(keysStr);
    const result: KeyHandler[] = [];

    keyMaps.forEach(({ key, shortcut }) => {
      const keyHandlers = handlers[key];
      if (!keyHandlers) return;

      keyHandlers.forEach((h) => {
        if (
          h.scope === scope &&
          h.shortcut.mods === shortcut.mods &&
          isEqArray(h.shortcut.special, shortcut.special)
        ) {
          result.push(h.method);
        }
      });
    });

    return result;
  };

  return {
    bind: bindKey,
    unbind: unbindKey,
    unsafeUnbind: unsafeUnbindKey,
    unbindScope,
    setScope,
    unbindAll,
    getScope,
    destroy,
    isBound,
    getBoundKeys,
    getHandlers,
  };
}
