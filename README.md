# keybuddy ⌨️

[![npm version](https://badge.fury.io/js/keybuddy.svg)](https://badge.fury.io/js/keybuddy)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Define and dispatch shortcuts with easy using keybuddy.

**keybuddy** provides a simple and consistent toolset for defining and dispatching keyboard shortcuts in a browser

 ## Usage
 
 ```bash
yarn add keybuddy
```

```javascript
import key from 'keybuddy';

key('a', e => handleKeyPress('a'))
key('shift+r', e => handleKeyPress('shift+r'))
key('⌘+shift+r, ctrl+shift+r', e => handleKeyPress('ctrl+shift+r'))

```

Based on [keymaster](https://github.com/madrobby/keymaster)

Differences:

1. Completely rewritten in modern js using TS
1. Support multiple keystrokes
1. Custom scope not conflicting with default one
1. Unbind requires an action (unsafeUnbindKey for backward compatibility)
1. Creator instance to replace document with any other DOM element
1. More explicit API
1. Provides new fixes and maintaining

## Migrating from keymaster

**Key differences:**
- Unbinding requires the handler function: `unbindKey('ctrl+s', handler)` instead of `key.unbind('ctrl+s')`
- Use `unsafeUnbindKey('ctrl+s')` if you need the old behavior (removes all handlers)
- Import what you need: `import { bindKey, setScope } from 'keybuddy'` instead of global `key`
- Modern browsers only (no IE11)

## Supported keys

Keybuddy understands the following modifiers:

`⇧` ,`shift` ,`⌥` ,`alt` ,`option` ,`⌃` ,`ctrl` ,`control` ,`⌘` ,`command` 

The following special keys can be used for shortcuts:

`backspace` ,`tab` ,`clear` ,`enter` ,`return` ,`esc` ,`escape` ,`space` ,`left` ,`up` ,`right` ,`down` ,`del` ,`delete` ,`home` ,`end` ,`pageup` ,`pagedown` ,`comma` ,`.` ,`/` ,``` ,`-` ,`=` ,`;` ,`'` ,`[` ,`]` ,`\`

## API

#### bindKey(keysStr: string, scopeOrMethod: string | () => {}, actionOrNothing?, {skipOther: boolean}?)

```javascript
import key, { DEFAULT_SCOPE } from 'keybuddy';
// import { bindKey } from 'keybuddy';

bindKey('option+e', action);
bindKey('option+e', 'myScope', action);
// use skipOther option to make primary action on same key bindings
bindKey('option+e', DEFAULT_SCOPE, action, { skipOther: true });
bindKey('option+e', 'myScope', action, { skipOther: true });
```

#### unbindKey(keysStr: string, scopeOrMethod: string | () => {}, actionOrNothing?)

**Action is required for unbind**

```javascript
import { unbindKey } from 'keybuddy';

unbindKey('option+e', action)
bindKey('option+e', 'myScope', action)
```

#### getScope()

Returns current scope

#### setScope()

Change scope

#### unbindScope()

Remove all scope actions

#### unbindAll()

Remove all actions

#### unsafeUnbindKey(keysStr: string, scope?: string)

Remove all actions for a key

```javascript
import { unsafeUnbindKey } from 'keybuddy';

unsafeUnbindKey('option+e')
unsafeUnbindKey('option+e', 'myScope')
```

#### destroy()

Remove all actions and event listeners


### keybuddy(doc: HTMLDocument | HTMLElement, filterFn?)

Keybuddy creator can be used to replace key bindings on document

*filterFn* by default skip all editable areas - contenteditable, input, select, textarea

The reasons that events like onpaste, oncopy want fire keyup event for key bindings

```javascript
import { createKeybuddy } from 'keybuddy/keybuddy';
const iframe = document.getElementById('#iframe').contentWindow;
/**
* { bind, unbind, unsafeUnbind, unbindScope, setScope, unbindAll, getScope:}
*/
const myKeybuddy = createKeybuddy(iframe, filterFn?) 

myKeybuddy.bind('alt+b', action);
```

For iframe usage examples, see [cypress/component/iframe-bindings.spec.ts](cypress/component/iframe-bindings.spec.ts).

### Deno
```typescript
import key from "jsr:@keybuddy/core";

key('a', e => handleKeyPress('a'))
key('shift+r', e => handleKeyPress('shift+r'))
key('⌘+shift+r, ctrl+shift+r', e => handleKeyPress('ctrl+shift+r'))
```
