export const isEqArray = (
  arr1: (string | number)[],
  arr2: (string | number)[]
): boolean => arr1.every((val, i) => arr2[i] === val);
