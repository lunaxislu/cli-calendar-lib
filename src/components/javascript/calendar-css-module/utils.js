import dayjs from "dayjs";

/**
 * This function is used to map data when rendering the Calendar component.
 * @param arr Each object in the array must have a `date` key.
 * @param format I recommend not changing the default value of `format`.
 * If you do change it,
 * @todo Please also update the `format` prop in the Calendar component's contents and the `identiFormat` accordingly.
 *
 * @Note The `array` must contain objects with a `date` key in order for the grouping to work.
 */

export function formattedGroupByKey(array, format = "YYYY. MM. DD") {
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
