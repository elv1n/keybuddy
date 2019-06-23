import creator from './creator';

const {
	bind, unbind, getScope, setScope, unbindScope, unbindAll
} = creator(document);

export const bindKey = bind;
export const unbindKey = unbind;
export {
	setScope, unbindScope, unbindAll, getScope
};
export default bind;
