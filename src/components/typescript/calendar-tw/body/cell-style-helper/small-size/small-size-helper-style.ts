import dayjs, { Dayjs } from "dayjs";

/**
 * @explain MONTH_MEMBERSHIP: Indicates whether a date belongs to the current month.
 * "IN_CURRENT_MONTH" : A date that belongs to the current month.
 * "OUTSIDE_CURRENT_MONTH" : A date that belongs to the previous or next month.
 */
const MONTH_MEMBERSHIP = {
  IN_CURRENT_MONTH: "IN_CURRENT_MONTH", // A date that belongs to the current month
  OUTSIDE_CURRENT_MONTH: "OUTSIDE_CURRENT_MONTH", // A date that belongs to the previous or next month
} as const;

/**
 * @explain DATE_RELATIVE_TO_TODAY: Indicates a date's relationship to today.
 */
const DATE_RELATIVE_TO_TODAY = {
  TODAY: "TODAY", // Today's date
  BEFORE_TODAY: "BEFORE_TODAY", // A date before today
  AFTER_TODAY: "AFTER_TODAY", // A date after today
} as const;

/**
 * @explain CALENDAR_DISPLAY_STATE: Indicates whether the calendar is active.
 * "ACTIVE" : The currently active calendar
 * "INACTIVE" : Another calendar (inactive state)
 */
const CALENDAR_DISPLAY_STATE = {
  ACTIVE: "ACTIVE", // The currently active calendar
  INACTIVE: "INACTIVE", // Another calendar (inactive state)
} as const;

/**
 * @explain DAY_TYPE: Represents the type of day (weekday or weekend).
 */
const DAY_TYPE = {
  SATURDAY: "SATURDAY", // Saturday
  SUNDAY: "SUNDAY", // Sunday
  WEEKDAY: "WEEKDAY", // Weekday
} as const;

/**
 *
 * @explain Returns whether the selected date belongs to the current month.
 * @params month: The selected date's month (Dayjs)
 * @params currentDate: The current date in the calendar (Dayjs)
 * @returns
 */
function getSmallSizeMonthMembershipStatus(month: Dayjs, currentDate: Dayjs) {
  return month.isSame(currentDate, "M")
    ? MONTH_MEMBERSHIP.IN_CURRENT_MONTH
    : MONTH_MEMBERSHIP.OUTSIDE_CURRENT_MONTH;
}

/**
 *
 * @explain Returns the relationship of a date to today.
 * @params day: The selected date (Dayjs)
 */
function getSmallSizeDateRelativeToToday(day: Dayjs) {
  const today = dayjs();
  if (day.isSame(today, "D")) return DATE_RELATIVE_TO_TODAY.TODAY;
  return day.isBefore(today, "D")
    ? DATE_RELATIVE_TO_TODAY.BEFORE_TODAY
    : DATE_RELATIVE_TO_TODAY.AFTER_TODAY;
}

/**
 *
 * @explain Returns the display state of the calendar (whether it's the current calendar).
 * @params month: The selected date's month (Dayjs)
 * @params currentDate: The current date in the calendar (Dayjs)
 */
function getSmallSizeCalendarDisplayState(month: Dayjs, currentDate: Dayjs) {
  return month.isSame(currentDate, "M")
    ? CALENDAR_DISPLAY_STATE.ACTIVE
    : CALENDAR_DISPLAY_STATE.INACTIVE;
}

/**
 *
 * @explain Returns the day type (Saturday, Sunday, or weekday).
 * @params day: The selected date (Dayjs)
 */
function getSmallSizeDayType(day: Dayjs) {
  if (day.day() === 6) return DAY_TYPE.SATURDAY;
  if (day.day() === 0) return DAY_TYPE.SUNDAY;
  return DAY_TYPE.WEEKDAY;
}

export {
  getSmallSizeCalendarDisplayState,
  getSmallSizeMonthMembershipStatus,
  getSmallSizeDateRelativeToToday,
  getSmallSizeDayType,
};
