export const isFirefox = navigator.userAgent.includes('Firefox');

export const isEditable = (el: HTMLElement) => el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA';
