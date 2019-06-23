import {DEFAULT_SCOPE} from './constants';
import {getKeyMap} from './helpers/keymap';
import {isEqArray} from './helpers/data';

type noop = (e: KeyboardEvent) => any;
interface Handler {
	scope: string;
	method: noop;
	mods: number[];
}

export default (doc?: HTMLDocument) => {
	let handlers: { [key: string]: Handler[]} = {};
	let downKeys: number[] = [];
	let activeScope = DEFAULT_SCOPE;

	const bindKey = (keysStr: string, scopeOrMethod: string | noop, methodOrNull: noop = () => {}) => {
		const scope: string = typeof scopeOrMethod === 'function' ? DEFAULT_SCOPE : scopeOrMethod;
		const method: noop = typeof scopeOrMethod === 'function' ? scopeOrMethod : methodOrNull;

		getKeyMap(keysStr).forEach(({code, mods}) => {
			if (!handlers[code]) {
				handlers[code] = [];
			}

			handlers[code].push({
				scope,
				method,
				mods
			});
		});
	};

	const unbindKeyProcess = (keysStr: string, deleteMethod: null | noop, deleteScope: string = DEFAULT_SCOPE) => {
		getKeyMap(keysStr).forEach(({code, mods}) => {
			const handler = handlers[code];
			if (Array.isArray(handler)) {
				const handler = handlers[code].filter(({scope, method, mods: methodMods}: Handler) => {
					return !(scope === deleteScope && isEqArray(methodMods, mods) && (deleteMethod === null ? true : method === deleteMethod));
				});
				if (handler.length) {
					handlers[code] = handler;
				} else {
					delete handlers[code];
				}
			}
		});
	};

	const unbindKey = (keysStr: string, scopeOrMethod: string | noop, methodOrNull: noop = () => {}) => {
		const deleteScope: string = typeof scopeOrMethod === 'function' ? DEFAULT_SCOPE : scopeOrMethod;
		const deleteMethod: noop = typeof scopeOrMethod === 'function' ? scopeOrMethod : methodOrNull;
		return unbindKeyProcess(keysStr, deleteMethod, deleteScope);
	};

	const unsafeUnbindKey = (keysStr: string, scope?: string) => {
		return unbindKeyProcess(keysStr, null, scope);
	};

	const fixedKey = (keyCode: number): number => keyCode === 93 || keyCode === 224 ? 91 : keyCode;

	const dispatch = (e: KeyboardEvent) => {
		const {keyCode} = e;
		const key = fixedKey(keyCode);
		if (!downKeys.includes(key)) {
			downKeys.push(key);
		}

		// See if we need to ignore the keypress (filter() can can be overridden)
		// by default ignore key presses if a select, textarea, or input is focused
		// if (!assignKey.filter.call(this, event)) return;

		// abort if no potentially matching shortcuts found
		if (!(key in handlers)) {
			return;
		}

		handlers[key].filter(({scope, mods}) => {
			if (scope !== activeScope) {
				return false;
			}

			return isEqArray(mods, downKeys);
		}).map(({method}: Handler) => method(e));
	};

	const cleanUp = (e: KeyboardEvent) => {
		const {keyCode} = e;
		const key = fixedKey(keyCode);
		downKeys = downKeys.filter(i => i !== key);
	};

	const unbindScope = (deleteScope: string) => {
		for (let keyCode in handlers) {
			if ({}.hasOwnProperty.call(handlers, keyCode)) {
				const handler = handlers[keyCode].filter(({scope}: Handler) => scope !== deleteScope);
				if (handler.length) {
					handlers[keyCode] = handler;
				} else {
					delete handlers[keyCode];
				}
			}
		}
	};

	const setScope = (scope: string) => {
		activeScope = scope;
	};

	const unbindAll = () => {
		handlers = {};
	};

	if (doc) {
		doc.addEventListener('keydown', dispatch);
		doc.addEventListener('keyup', cleanUp);
	}

	return {bind: bindKey, unbind: unbindKey, unsafeUnbind: unsafeUnbindKey, unbindScope, setScope, unbindAll, getScope: () => activeScope};
};
