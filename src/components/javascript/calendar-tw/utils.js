import dayjs from "dayjs";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
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
  }, new Map());
}

export function isValidDate(date, format = "YYYY. MM. DD") {
  // Unix 타임스탬프 처리 (number로만 가능한 경우)
  if (typeof date === "number") {
    const isMilliseconds = date > 9999999999;
    const parsedDate = isMilliseconds ? dayjs(date) : dayjs.unix(date);
    return parsedDate.isValid() ? parsedDate.format(format) : null;
  }

  // 문자열로 들어오는 날짜를 처리
  if (typeof date === "string") {
    // ISO 8601 형식으로 파싱
    const parsedDate = dayjs(date);
    if (parsedDate.isValid()) {
      return parsedDate.format(format);
    }

    // MM/DD/YYYY 형식의 문자열을 수동으로 처리
    const parts = date.split("/");
    if (parts.length === 3) {
      // MM/DD/YYYY -> YYYY-MM-DD로 변환
      const [month, day, year] = parts;
      const reformattedDate = `${year}-${month}-${day}`;
      const finalDate = dayjs(reformattedDate);
      return finalDate.isValid() ? finalDate.format(format) : null;
    }

    return null; // 유효하지 않은 날짜 형식일 경우
  }

  // Date 객체 처리
  if (date instanceof Date) {
    const parsedDate = dayjs(date);
    return parsedDate.isValid() ? parsedDate.format(format) : null;
  }

  return null; // 유효하지 않은 경우
}
