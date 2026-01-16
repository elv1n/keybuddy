import { CAPS_LOCK_KEY, DEFAULT_SCOPE, KeyString, MODS } from './constants';
import {
  getKeyIdentifier,
  isModifierKey,
  updateModifiers,
} from './helpers/keyboard';
import { getKeyMap, KeyMap, ParsedShortcut } from './helpers/keymap';
import { invariant, isEditable, isEqArray, isFirefox } from './helpers/utils';

type KeyHandler = (e: KeyboardEvent) => void;
type FilterFn = (el: KeyboardEvent) => boolean;

interface Handler {
  scope: string;
  method: KeyHandler;
  shortcut: ParsedShortcut;
  sequence?: KeyMap[];
  skipOther: boolean;
}

interface SequenceState {
  handler: Handler;
  nextIndex: number;
  timestamp: number;
}

const SEQUENCE_TIMEOUT = 1000;

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
  let activeSequences: SequenceState[] = [];

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

    const { key, shortcut, sequence } = getKeyMap(keysStr);
    if (!handlers[key]) {
      handlers[key] = [];
    }
    const handlerList = handlers[key];
    if (process.env.NODE_ENV === 'development') {
      if (skipOther) {
        const action = handlerList.find((i) => i.skipOther);
        invariant(
          !action,
          "Conflicting 'skipOther' property with action",
          action,
        );
      }
    }

    handlerList.push({
      scope,
      method,
      shortcut,
      sequence,
      skipOther,
    });
  };

  const unbindKeyProcess = (
    keysStr: string,
    deleteMethod: null | KeyHandler,
    deleteScope: string = DEFAULT_SCOPE,
  ): void => {
    const { key, shortcut } = getKeyMap(keysStr);
    const keyHandlers = handlers[key];
    if (Array.isArray(keyHandlers)) {
      const filtered = keyHandlers.filter(
        ({ scope, method, shortcut: methodShortcut }: Handler) =>
          !(
            scope === deleteScope &&
            methodShortcut.mods === shortcut.mods &&
            isEqArray(methodShortcut.special, shortcut.special) &&
            (deleteMethod === null ? true : method === deleteMethod)
          ),
      );
      if (filtered.length) {
        handlers[key] = filtered;
      } else {
        delete handlers[key];
      }
    }
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

  const matchesCombo = (
    combo: KeyMap,
    currentKey: KeyString,
    currentMods: number,
    currentDownKeys: Set<KeyString>,
  ): boolean => {
    return (
      combo.key === currentKey &&
      combo.shortcut.mods === currentMods &&
      isEqArray(combo.shortcut.special, Array.from(currentDownKeys))
    );
  };

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

    const now = Date.now();
    let sequenceMatched = false;

    activeSequences = activeSequences.filter((seq) => {
      if (now - seq.timestamp > SEQUENCE_TIMEOUT) {
        return false;
      }

      const nextCombo = seq.handler.sequence?.[seq.nextIndex];
      if (!nextCombo) {
        return false;
      }

      if (matchesCombo(nextCombo, key, modifiers, downKeys)) {
        sequenceMatched = true;
        if (seq.nextIndex === (seq.handler.sequence?.length ?? 0) - 1) {
          seq.handler.method(e);
          return false;
        }
        seq.nextIndex++;
        seq.timestamp = now;
        return true;
      }

      return false;
    });

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

    for (const handler of currentHandlers) {
      if (handler.sequence?.length) {
        activeSequences.push({
          handler,
          nextIndex: 0,
          timestamp: now,
        });
        sequenceMatched = true;
      }
    }

    // Don't fire standalone handlers if any sequence activity occurred
    // (sequence started, advanced, or completed)
    if (sequenceMatched) {
      return;
    }

    const nonSequenceHandlers = currentHandlers.filter(
      (h) => !h.sequence?.length,
    );

    const primaryAction = nonSequenceHandlers.find(
      (action) => action.skipOther,
    );

    if (primaryAction) {
      primaryAction.method(e);
    } else {
      nonSequenceHandlers.forEach(({ method }) => {
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
    activeSequences = [];
  };

  const reset = (): void => {
    downKeys.clear();
    activeSequences = [];
  };

  const destroy = (): void => {
    downKeys.clear();
    handlers = {};
    activeSequences = [];
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
    const { key, shortcut } = getKeyMap(keysStr);
    const keyHandlers = handlers[key];
    if (!keyHandlers) return false;

    return keyHandlers.some(
      (h) =>
        h.scope === scope &&
        h.shortcut.mods === shortcut.mods &&
        isEqArray(h.shortcut.special, shortcut.special),
    );
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
    const { key, shortcut } = getKeyMap(keysStr);
    const keyHandlers = handlers[key];
    if (!keyHandlers) return [];

    return keyHandlers
      .filter(
        (h) =>
          h.scope === scope &&
          h.shortcut.mods === shortcut.mods &&
          isEqArray(h.shortcut.special, shortcut.special),
      )
      .map((h) => h.method);
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
