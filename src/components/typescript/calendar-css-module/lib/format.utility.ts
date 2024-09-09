import { Dayjs } from "dayjs";

/**
 *
 * @param date Dayjs Object
 * @param format year, month, and day of transformation
 * @returns
 */
export const formatDayToString = (date: Dayjs, format: string) => {
  return date.format(format);
};

/**
 * Returns an array containing an object with one or more keys to the object, grouped by the specified key.
 *
 * @param arr Arrangement of objects : {...}[]
 * @param key Key that will be the standard for grouping
 * @returns HashMap
 */
export function formattedGroupByKey<
  T extends { [key: string | number]: unknown },
>(array: T[], key: keyof T) {
  return array.reduce((acc, cur) => {
    const stringkey = cur[key] as string;
    if (acc.get(stringkey)) {
      acc.get(stringkey)?.push(cur);
    } else {
      acc.set(stringkey, [cur]);
    }
    return acc;
  }, new Map<keyof T, T[]>());
}
