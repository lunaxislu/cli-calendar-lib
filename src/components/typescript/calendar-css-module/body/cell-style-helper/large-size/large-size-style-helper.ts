import dayjs, { Dayjs } from "dayjs";
/**
 * @explain MONTH_MEMBERSHIP: Indicates whether a date belongs to the current month.
 * "IN_CURRENT_MONTH" : Date within the current month.
 * "OUTSIDE_CURRENT_MONTH" : Date in the previous or next month.
 */
const MONTH_MEMBERSHIP = {
  IN_CURRENT_MONTH: "IN_CURRENT_MONTH", // Date within the current month
  OUTSIDE_CURRENT_MONTH: "OUTSIDE_CURRENT_MONTH", // Date in the previous or next month
} as const;

/**
 * @explain DATE_RELATIVE_TO_TODAY: Indicates the relationship of a date to today.
 */
const DATE_RELATIVE_TO_TODAY = {
  TODAY: "TODAY", // Today's date
  BEFORE_TODAY: "BEFORE_TODAY", // Date before today
  AFTER_TODAY: "AFTER_TODAY", // Date after today
} as const;

/**
 * @explain Returns whether the date belongs to the current month in Big Mode.
 * @param month
 * @param currentDate
 * @returns
 */

function getLargeSizeMonthMembershipStatus(month: Dayjs, currentDate: Dayjs) {
  return month.isSame(currentDate, "M")
    ? MONTH_MEMBERSHIP.IN_CURRENT_MONTH
    : MONTH_MEMBERSHIP.OUTSIDE_CURRENT_MONTH;
}

/**
 * @explain Returns the relationship of the date to today in Big Mode.
 * @param day
 * @returns
 */
//
function getLargeSizeDateRelativeToToday(day: Dayjs) {
  const today = dayjs();
  if (day.isSame(today, "D")) return DATE_RELATIVE_TO_TODAY.TODAY;
  return day.isBefore(today, "D")
    ? DATE_RELATIVE_TO_TODAY.BEFORE_TODAY
    : DATE_RELATIVE_TO_TODAY.AFTER_TODAY;
}

export { getLargeSizeDateRelativeToToday, getLargeSizeMonthMembershipStatus };
