import {SPECIAL} from '../constants';

export interface KeyMap {
	code: number;
	mods: number[];
}

const getKeyCode = (key: string): number => SPECIAL[key] || key.toUpperCase().charCodeAt(0);

const getMods = (keys: string[]): number[] => keys.map(key => SPECIAL[key] || key.toUpperCase().charCodeAt(0));

const getCombinations = (keysStr: string): string[] => {
	const cleanKeys = keysStr.replace(/\s/g, '');
	const keys = cleanKeys.split(',');
	if (keys[keys.length - 1] === '') {
		keys[keys.length - 2] += ',';
	}

	return keys;
};

export const getKeyMap = (keysStr: string): KeyMap[] => {
	const keymap = getCombinations(keysStr);
	return keymap.map(keyCmd => {
		const keys = keyCmd.split('+');
		const key = keys[keys.length - 1];
		const code = getKeyCode(key);
		const mods = getMods(keys);

		return {
			code,
			mods
		};
	});
};
