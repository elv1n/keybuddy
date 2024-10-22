import creator from './creator';
import { DEFAULT_SCOPE } from './constants';

const {
  bind,
  unbind,
  unsafeUnbind,
  getScope,
  setScope,
  unbindScope,
  unbindAll,
  destroy
} = creator(document);

export const bindKey = bind;
export const unbindKey = unbind;
export const unsafeUnbindKey = unsafeUnbind;
export { setScope, unbindScope, unbindAll, getScope, destroy, DEFAULT_SCOPE };
export default bind;
