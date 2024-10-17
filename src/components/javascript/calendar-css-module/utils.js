import dayjs from "dayjs";

/**
 * Returns an array containing an object with one or more keys to the object, grouped by the specified key.
 *
 * @param arr Arrangement of objects : {...}[]
 * @param key Key that will be the standard for grouping
 * @returns HashMap
 */

export function formattedGroupByKey(array, format) {
  return array.reduce((acc, cur) => {
    const dateKey = dayjs(cur.date).format(format);
    if (acc.has(dateKey)) {
      acc.get(dateKey)?.push(cur);
    } else {
      acc.set(dateKey, [cur]);
    }
    return acc;
  }, new Map());
}
