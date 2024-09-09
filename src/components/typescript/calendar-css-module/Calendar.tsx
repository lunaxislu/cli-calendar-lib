import clsx from "clsx";
import styles from "./calendar.module.css";

import { CALENDAR_SIZE } from "./const/const";
import { ComponentPropsWithoutRef, useMemo } from "react";
import HeaderGrid from "./headerController/HeaderGrid";
import CalendarDays from "./days/CalendarDays";
import CalendarBody from "./body/CalendarBody";

interface CalendarProps extends ComponentPropsWithoutRef<"div"> {
  size?: CalendarSizeType;
  mode?: CalendarModeType; //. if you want to put a condition on each Module
  page?: CalendarPageType; // If you want to put a condition on each page
}
const Calendar = ({ size = CALENDAR_SIZE.SMALL }: CalendarProps) => {
  const calendarGrid = useMemo(
    () =>
      clsx({
        [styles["sm-calendar-grid"]]: size === CALENDAR_SIZE.SMALL,
        [styles["lg-calendar-grid"]]: size === CALENDAR_SIZE.LARGE,
      }),
    [size],
  );

  const calendarInnerGrid = useMemo(
    () =>
      clsx({
        [styles["sm-size-header-grid"]]: size === CALENDAR_SIZE.SMALL,
        [styles["lg-size-grid"]]: size === CALENDAR_SIZE.LARGE,
      }),
    [size],
  );

  return (
    <div className={calendarGrid}>
      <div className={calendarInnerGrid}>
        <HeaderGrid size={size} />
        <CalendarDays size={size} />
        <CalendarBody size={size} />
        {/* {props.children}  lf you want.*/}
      </div>
    </div>
  );
};

export default Calendar;
