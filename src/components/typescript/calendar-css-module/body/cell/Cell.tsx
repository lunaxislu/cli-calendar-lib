import dayjs, { Dayjs } from "dayjs";
import React from "react";
import { CALENDAR_SIZE, FORMAT_CELL_DATE } from "../../const/const";
import { largeSize, smallSize } from "../cell-style-helper";

interface CellProps {
  day: Dayjs;
  size: CalendarSizeType;
  mode?: CalendarModeType;
  page?: CalendarPageType;
}
const Cell = ({ day, size }: CellProps) => {
  const currentDate = dayjs(); // Temporary value, Please manage this globally

  /**
   * const SELECTED_DAY = "SELECTEDTYPE" used 56line;
   */

  const formatDate = day.format(FORMAT_CELL_DATE).substring(6);

  /** conditional*/
  if (size === CALENDAR_SIZE.LARGE)
    return (
      <div
        className={largeSize.bigCalendarDateStyle({
          monthMembership: largeSize.getLargeSizeMonthMembershipStatus(
            day,
            currentDate,
          ),
          dateRelativeToToday: largeSize.getLargeSizeDateRelativeToToday(day),
        })}
      >
        <p>{formatDate}</p>
      </div>
    );

  /**default Mini Mode */
  return (
    <div
      className={smallSize.smallCalendarDateStyle({
        calendarDisplayState: smallSize.getSmallSizeCalendarDisplayState(
          day,
          currentDate,
        ),
        monthMembership: smallSize.getSmallSizeMonthMembershipStatus(
          day,
          currentDate,
        ),
        dateRelativeToToday: smallSize.getSmallSizeDateRelativeToToday(day),
      })}
    >
      <span
        className={smallSize.dayStyleVariant({
          dayType: smallSize.getSmallSizeDayType(day),
          /**
           * selectedDay:day.isSame(selectedDate, "day")
                ? SELECTED_DAY
                : null,
           */
        })}
      >
        {formatDate}
      </span>
    </div>
  );
};

export default React.memo(Cell);
