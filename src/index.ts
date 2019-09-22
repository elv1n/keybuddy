import creator from './creator';

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
export { setScope, unbindScope, unbindAll, getScope, destroy };
export default bind;
