# keybuddy ⌨️

Define and dispatch shortcuts with easy using keybuddy.

**keybuddy** provides a simple and consistent toolset for defining and dispatching keyboard shortcuts in a browser

 ## Usage
 
 ```bash
yarn add keybuddy
```

```javascript
import key from 'keybuddy';

key('a', e => console.log('a pressed'))
key('shift+r', e => console.log('shift+r pressed'))
key('⌘+shift+r, ctrl+shit+r', e => console.log('ctrl+shit+r pressed'))

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


### creator(doc: HTMLDocument | HTMLElement, filterFn?)

Keybuddy creator can be used to replace key bindings on document

*filterFn* by default skip all editable areas - contenteditable, input, select, textarea

The reasons that events like onpaste, oncopy want fire keyup event for key bindings

```javascript
import creator from 'keybuddy/creator';
const iframe = document.getElementById('#iframe').contentWindow;
/**
* { bind, unbind, unsafeUnbind, unbindScope, setScope, unbindAll, getScope:}
*/
const myKeybuddy = creator(iframe, filterFn?) 

myKeybuddy.bind('alt+b', action);
```
