export const isEqArray = (
  arr1: (string | number)[],
  arr2: (string | number)[],
): boolean => arr1.every((val, i) => arr2[i] === val);

// TODO refactor to use strings
export const isBoolArrayToObject = (
  arr: (string | number)[],
  obj: { [key: string]: boolean },
): boolean => {
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const numKey = Number(key);
      if (obj[key] && !arr.includes(numKey)) {
        return false;
      }
      if (arr.includes(numKey) && !obj[key]) {
        return false;
      }
    }
  }
  return true;
};
