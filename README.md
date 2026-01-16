# keybuddy ⌨️

[![npm version](https://badge.fury.io/js/keybuddy.svg)](https://badge.fury.io/js/keybuddy)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Define and dispatch keyboard shortcuts with keybuddy.

**keybuddy** provides a simple and consistent toolset for defining and dispatching keyboard shortcuts in a browser environment.

## Usage

```bash
pnpm add keybuddy
```

```javascript
import { bindKey } from 'keybuddy';

bindKey('a', handleKeyPress);
bindKey('shift+r', handleKeyPress);
bindKey('command+shift+r', handleKeyPress);
// sequences
bindKey('cmd+e k', handleKeyPress);
bindKey('g i', handleKeyPress);
```

Initially based on [keymaster](https://github.com/madrobby/keymaster)

Differences:

1. Written modern JS using TypeScript
2. Custom scope not conflicting with default one
3. Unbind requires an action (unsafeUnbindKey for backward compatibility)
4. Creator instance to replace document with any other DOM element
5. More explicit API
6. Provides new fixes and maintaining
7. Added sequence support
8. Removed support for multiple shortcuts in a single string

## Migrating from keymaster

**Key differences:**
- Unbinding requires the handler function: `unbindKey('ctrl+s', handler)` instead of `key.unbind('ctrl+s')`
- Use `unsafeUnbindKey('ctrl+s')` if you need the old behavior (removes all handlers)
- Import what you need: `import { bindKey, setScope } from 'keybuddy'`
- Modern browsers only (no IE11)
- Split multiple key bindings into separate calls `'cmd+r, ctrl+r'` into `cmd+r`, `ctrl+r`

## Supported keys

Keybuddy understands the following modifiers:

`shift`, `alt`, `option`, `ctrl`, `control`, `command`, `cmd`

Symbol variants: `⇧`, `⌥`, `⌃`, `⌘`

The following special keys can be used for shortcuts:

`backspace`, `tab`, `clear`, `enter`, `return`, `esc`, `escape`, `space`, `left`, `up`, `right`, `down`, `del`, `delete`, `home`, `end`, `pageup`, `pagedown`, `comma`, `.`, `/`, `` ` ``, `-`, `=`, `;`, `'`, `[`, `]`, `\`

## Sequences

Keybuddy supports sequence shortcuts - multiple key combinations pressed in order:

```javascript
// Press 'g', release, then press 'i'
bindKey('g i', () => goToInbox());

// Press Cmd+K, release, then press Cmd+C
bindKey('cmd+k cmd+c', () => copyCode());

// Press Cmd+Z, release, then press 'y'
bindKey('cmd+z y', () => confirmUndo());
```

**Syntax:**
- `'cmd+z+y'` = chord (all keys held simultaneously)
- `'cmd+z y'` = sequence (press Cmd+Z, release, then press Y)

Sequences timeout after 1 second.

## API

### bindKey(keysStr, scopeOrMethod, actionOrNothing?, options?)

Bind a keyboard shortcut to a handler.

```javascript
import { bindKey, DEFAULT_SCOPE } from 'keybuddy';

bindKey('option+e', action);
bindKey('option+e', 'myScope', action);
bindKey('option+e', DEFAULT_SCOPE, action, { skipOther: true });
```

**Options:**
- `skipOther: boolean` - If true, this handler takes priority and other handlers for the same shortcut won't fire

### unbindKey(keysStr, scopeOrMethod, actionOrNothing?)

Unbind a keyboard shortcut. **Action is required.**

```javascript
import { unbindKey } from 'keybuddy';

unbindKey('option+e', action);
unbindKey('option+e', 'myScope', action);
```

### unsafeUnbindKey(keysStr, scope?)

Remove all handlers for a key (use with caution).

```javascript
import { unsafeUnbindKey } from 'keybuddy';

unsafeUnbindKey('option+e');
unsafeUnbindKey('option+e', 'myScope');
```

### isBound(keysStr, options?)

Check if a shortcut is bound.

```javascript
import { bindKey, isBound } from 'keybuddy';

bindKey('ctrl+s', saveHandler);
isBound('ctrl+s'); // true
isBound('ctrl+s', { scope: 'editor' }); // false
```

### getBoundKeys(options?)

Get all bound shortcuts in current or specified scope.

```javascript
import { bindKey, getBoundKeys } from 'keybuddy';

bindKey('ctrl+s', saveHandler);
bindKey('ctrl+z', undoHandler);
getBoundKeys(); // ['ctrl+s', 'ctrl+z']
getBoundKeys({ scope: 'editor' }); // []
```

### getHandlers(keysStr, options?)

Get all handlers for a specific shortcut.

```javascript
import { bindKey, getHandlers } from 'keybuddy';

const save = () => console.log('save');
bindKey('ctrl+s', save);
getHandlers('ctrl+s'); // [save]
```

### getScope()

Returns current scope.

### setScope(scope)

Change the active scope.

### unbindScope(scope)

Remove all actions in a scope.

### unbindAll()

Remove all actions.

### destroy()

Remove all actions and event listeners.

## Custom Document / Iframe

Use `createKeybuddy` to bind shortcuts to a different document or element.

```javascript
import { createKeybuddy } from 'keybuddy';

const iframe = document.getElementById('iframe').contentWindow;
const myKeybuddy = createKeybuddy(iframe.document);

myKeybuddy.bind('alt+b', action);
```

The default filter skips editable areas (contenteditable, input, select, textarea). You can provide a custom filter:

```javascript
const myKeybuddy = createKeybuddy(document, (e) => {
  return true; // Handle all events
});
```

For iframe usage examples, see [cypress/component/iframe-bindings.spec.ts](cypress/component/iframe-bindings.spec.ts).