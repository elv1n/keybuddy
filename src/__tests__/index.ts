import {fireEvent} from '@testing-library/dom';
import {KEY_E, KEY_R, KEY_ALT, KEY_LEFT_CMD} from 'keycode-js';

import {bindKey, setScope, unbindAll, unbindScope, unbindKey, unsafeUnbindKey} from '../index';
import {getKeyMap} from '../helpers/keymap';
import {DEFAULT_SCOPE, SPECIAL} from '../constants';

const ALT_EVENT = {
	altKey: true,
	code: 'AltLeft',
	key: 'Alt',
	keyCode: KEY_ALT
};

const TEST_SCOPE = 'test';

interface UseEvent {
	keyCode: number;
	key?: string;
	code?: string;
}
const useEvent = (event: UseEvent) => [
	() => fireEvent.keyUp(document, event),
	() => fireEvent.keyDown(document, event)
];

const [upE, downE] = useEvent({key: 'e', keyCode: KEY_E});
const [upR, downR] = useEvent({key: 'e', keyCode: KEY_R});
const [upAlt, downAlt] = useEvent(ALT_EVENT);
const [upCmd, downCmd] = useEvent({code: 'MetaLeft', key: 'Meta', keyCode: KEY_LEFT_CMD});

const downKeymap = (keysStr: string) => {
	getKeyMap(keysStr).forEach(({mods}) => {
		mods.forEach(code => {
			const [_, down] = useEvent({keyCode: code});
			down();
		});
	});
};

const upKeymap = (keysStr: string) => {
	getKeyMap(keysStr).forEach(({mods}) => {
		mods.forEach(code => {
			const [up] = useEvent({keyCode: code});
			up();
		});
	});
};

describe('document', () => {
	afterEach(() => {
		setScope(DEFAULT_SCOPE);
		unbindAll();
	});
	it('should call simple event', () => {
		const spy = jest.fn();
		bindKey('e', spy);
		downE();
		expect(spy).toHaveBeenCalledTimes(1);
		upE();
	});

	it('should not call all scope when specified', () => {
		const spy = jest.fn();
		setScope('test');

		bindKey('e', spy);
		downE();
		expect(spy).toHaveBeenCalledTimes(0);
		upE();
	});

	it('should call scoped event', () => {
		const spy = jest.fn();
		setScope('test');

		bindKey('e', 'test', spy);
		downE();

		expect(spy).toHaveBeenCalledTimes(1);
		upE();
	});

	it('should call alt+e', () => {
		const spy = jest.fn();

		bindKey('alt+e', spy);

		downAlt();
		downE();

		expect(spy).toHaveBeenCalledTimes(1);

		upE();
		upAlt();
	});

	it('should call command+alt+e', () => {
		const spy = jest.fn();

		bindKey('command+alt+e', spy);

		downCmd();
		downAlt();
		downE();

		expect(spy).toHaveBeenCalledTimes(1);

		upE();
		upAlt();
		upCmd();
	});

	it('should call command+alt+e in scope', () => {
		const spy = jest.fn();

		setScope('test');
		bindKey('command+alt+e', 'test', spy);

		downCmd();
		downAlt();
		downE();

		expect(spy).toHaveBeenCalledTimes(1);

		upE();
		upAlt();
		upCmd();
	});

	it('should not call command+alt+e without scope', () => {
		const spy = jest.fn();

		bindKey('command+alt+e', 'test', spy);

		downCmd();
		downAlt();
		downE();

		expect(spy).toHaveBeenCalledTimes(0);

		upE();
		upAlt();
		upCmd();
	});

	it('should call on command+e and alt+r', () => {
		const spy = jest.fn();

		bindKey('command+e, alt+r', spy);

		downCmd();
		downE();

		upE();
		upCmd();

		downAlt();
		downR();

		upAlt();
		upR();

		expect(spy).toHaveBeenCalledTimes(2);
	});

	it('should call on command+e and alt+r in a scope', () => {
		const spy = jest.fn();

		setScope('test');
		bindKey('command+e, alt+r', 'test', spy);

		downCmd();
		downE();

		upE();
		upCmd();

		downAlt();
		downR();

		upAlt();
		upR();

		expect(spy).toHaveBeenCalledTimes(2);
	});

	it('should call with specials', () => {
		Object.keys(SPECIAL).forEach(key => {
			const keyCode = SPECIAL[key];
			const spy = jest.fn();
			bindKey(`${key}+e`, spy);

			const [upSpecial, downSpecial] = useEvent({key, keyCode: keyCode});
			downSpecial();
			downE();

			expect(spy).toHaveBeenCalledTimes(1);

			upSpecial();
			upE();
		});
	});

	it('should delete scope binds', () => {
		const spy = jest.fn();
		bindKey('e', 'test', spy);
		unbindScope('test');
		downE();
		upE();
		expect(spy).toHaveBeenCalledTimes(0);
	});

	it('should unbind key e', () => {
		const spy = jest.fn();
		bindKey('e', spy);
		unbindKey('e', spy);
		downE();
		upE();
		expect(spy).toHaveBeenCalledTimes(0);
	});

	it('should delete scope key command+e', () => {
		const spy = jest.fn();
		bindKey('command+e', TEST_SCOPE, spy);
		setScope(TEST_SCOPE);

		// Key keymap combination on unbind key
		unbindKey('command+e', TEST_SCOPE, spy);
		downCmd();
		downE();

		upCmd();
		upE();
		expect(spy).toHaveBeenCalledTimes(0);
	});

	it('should accept multiple keystrokes ctrl+r+s', () => {
		const spy = jest.fn();
		const keys = 'ctrl+r+s';
		bindKey(keys, spy);
		downKeymap(keys);
		upKeymap(keys);

		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should accept multiple keystrokes command+shift+w+p', () => {
		const spy = jest.fn();
		const keys = 'command+shift+w+p';
		bindKey(keys, spy);
		downKeymap(keys);
		upKeymap(keys);

		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should accept multiple keystrokes in out test', () => {
		const spy = jest.fn();
		const keys = 'command+shift+w+p';
		bindKey(keys, spy);
		downKeymap(keys);
		upKeymap(keys);

		const spy1 = jest.fn();
		const keys1 = 'ctrl+shift+a+b';
		bindKey(keys1, spy1);
		downKeymap(keys1);
		upKeymap(keys1);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should unbind without method', () => {
		const spy = jest.fn();
		const keys = 'command+shift+w+p';
		bindKey(keys, spy);
		unsafeUnbindKey(keys);
		downKeymap(keys);
		upKeymap(keys);
		expect(spy).toHaveBeenCalledTimes(0);
	});

	it('should not unbind without method for scope', () => {
		const spy = jest.fn();
		const keys = 'command+shift+w+p';
		bindKey(keys, spy);

		unsafeUnbindKey(keys, TEST_SCOPE);
		downKeymap(keys);
		upKeymap(keys);
		expect(spy).toHaveBeenCalledTimes(1);
	});

	it('should not unbind without method for scope', () => {
		const spy = jest.fn();
		const keys = 'command+shift+w+p';
		bindKey(keys, TEST_SCOPE, spy);

		unsafeUnbindKey(keys, TEST_SCOPE);
		downKeymap(keys);
		upKeymap(keys);
		expect(spy).toHaveBeenCalledTimes(0);
	});
});
