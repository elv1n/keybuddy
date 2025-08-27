import { DEFAULT_SCOPE } from './constants';
import { createKeybuddy } from './keybuddy';

const {
  bind,
  unbind,
  unsafeUnbind,
  getScope,
  setScope,
  unbindScope,
  unbindAll,
  destroy,
} = createKeybuddy(document);

export const bindKey = bind;
export const unbindKey = unbind;
export const unsafeUnbindKey = unsafeUnbind;
export { setScope, unbindScope, unbindAll, getScope, destroy, DEFAULT_SCOPE };
export type { KeyString } from './constants';
export default bind;
