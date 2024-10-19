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
export function formattedGroupByKey<T extends { date: string | Date | number }>(
  array: T[],
  format: string = "YYYY. MM. DD",
): Map<dayjs.FormatObject["format"], T[]> {
  return array.reduce((acc, cur) => {
    if (!cur.date) {
      throw new Error(`Missing 'date' field in object: ${JSON.stringify(cur)}`);
    }

    // 유틸리티 함수를 사용해 날짜를 안전하게 포맷
    const dateKey = isValidDate(cur.date, format);

    if (!dateKey) {
      throw new Error(`Invalid date: ${cur.date}`); // 유효하지 않은 날짜일 경우 예외 처리
    }

    if (acc.has(dateKey)) {
      acc.get(dateKey)?.push(cur);
    } else {
      acc.set(dateKey, [cur]);
    }
    return acc;
  }, new Map<dayjs.FormatObject["format"], T[]>());
}

function isValidDate(
  date: Date | number | string,
  format: string = "YYYY. MM. DD",
): string | null {
  // Unix 타임스탬프 처리 (number로만 가능한 경우)
  if (typeof date === "number") {
    const parsedDate = date > 9999999999 ? dayjs(date) : dayjs.unix(date);
    return parsedDate.isValid() ? parsedDate.format(format) : null;
  }

  // 문자열로 들어오는 날짜를 처리
  if (typeof date === "string") {
    // ISO 8601 및 MM/DD/YYYY 형식을 자동으로 처리
    const parsedDate = dayjs(
      date,
      ["MM/DD/YYYY", "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ssZ"],
      true,
    );

    // 유효한 날짜인지 확인 후 포맷 반환
    return parsedDate.isValid() ? parsedDate.format(format) : null;
  }

  // Date 객체 처리
  if (date instanceof Date) {
    const parsedDate = dayjs(date);
    return parsedDate.isValid() ? parsedDate.format(format) : null;
  }

  return null; // 유효하지 않은 경우
}
