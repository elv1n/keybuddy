import { DEFAULT_SCOPE } from './constants';
import { createKeybuddy } from './keybuddy';

export { createKeybuddy };

const {
  bind,
  unbind,
  unsafeUnbind,
  getScope,
  setScope,
  unbindScope,
  unbindAll,
  destroy,
  isBound,
  getBoundKeys,
  getHandlers,
} = createKeybuddy(document);

export const bindKey = bind;
export const unbindKey = unbind;
export const unsafeUnbindKey = unsafeUnbind;

export {
  setScope,
  unbindScope,
  unbindAll,
  getScope,
  destroy,
  isBound,
  getBoundKeys,
  getHandlers,
  DEFAULT_SCOPE,
};
export type { KeyString } from './constants';
export { MODS, SPECIAL } from './constants';

export default bind;
