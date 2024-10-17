import dayjs from "dayjs";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * This function is used to map data when rendering the Calendar component.
 * @param arr Each object in the array must have a `date` key.
 * @param format I recommend not changing the default value of `format`.
 * If you do change it,
 * @todo Please also update the `format` prop in the Calendar component's contents and the `identiFormat` accordingly.
 *
 * @Note The `array` must contain objects with a `date` key in order for the grouping to work.
 */
export function formattedGroupByKey<T extends { date: string }>(
  array: T[],
  format: string = "YYYY. MM. DD",
): Map<dayjs.FormatObject["format"], T[]> {
  return array.reduce((acc, cur) => {
    const dateKey = dayjs(cur.date).format(format);
    if (acc.has(dateKey)) {
      acc.get(dateKey)?.push(cur);
    } else {
      acc.set(dateKey, [cur]);
    }
    return acc;
  }, new Map<dayjs.FormatObject["format"], T[]>());
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
