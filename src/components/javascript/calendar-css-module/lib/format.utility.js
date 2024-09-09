/**
 *
 * @param date Dayjs Object
 * @param format year, month, and day of transformation
 * @returns
 */
export const formatDayToString = (date, format) => {
  return date.format(format);
};

/**
 * Returns an array containing an object with one or more keys to the object, grouped by the specified key.
 *
 * @param arr Arrangement of objects : {...}[]
 * @param key Key that will be the standard for grouping
 * @returns HashMap
 */
export function formattedGroupByKey(array, key) {
  return array.reduce((acc, cur) => {
    const stringkey = cur[key];
    if (acc.get(stringkey)) {
      acc.get(stringkey)?.push(cur);
    } else {
      acc.set(stringkey, [cur]);
    }
    return acc;
  }, new Map());
}
