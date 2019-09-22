export const isFirefox = navigator.userAgent.includes('Firefox');

export const isEditable = (el: HTMLElement): boolean =>
  el.isContentEditable ||
  el.tagName === 'INPUT' ||
  el.tagName === 'SELECT' ||
  el.tagName === 'TEXTAREA';
