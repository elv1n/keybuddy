export const invariant = (
  condition: boolean,
  message: string,
  ...args: unknown[]
) => {
  if (
    typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV === 'development' &&
    !condition
  ) {
    throw new Error(
      `Invariant failed: ${message}${args.length ? ` ${JSON.stringify(args)}` : ''}`,
    );
  }
};

export const isFirefox =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox');

export const isEditable = (el: HTMLElement): boolean =>
  el.isContentEditable ||
  el.tagName === 'INPUT' ||
  el.tagName === 'SELECT' ||
  el.tagName === 'TEXTAREA';

export const isEqArray = (
  arr1: (string | number)[],
  arr2: (string | number)[],
): boolean => {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
};
