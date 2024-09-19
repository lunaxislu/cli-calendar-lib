import clsx from "clsx";
import styles from "./calendar.module.css";
import React, { useState } from "react";
import {
  CalendarSizeType,
  CalendarModeType,
  CalendarPageType,
} from "./types/Calendar";
import { CALENDAR_SIZE } from "./const/const";
import { ComponentPropsWithoutRef, useMemo } from "react";
import HeaderGrid from "./headerController/HeaderGrid";
import CalendarDays from "./days/CalendarDays";
import CalendarBody from "./body/CalendarBody";
import dayjs, { Dayjs } from "dayjs";

interface CalendarProps extends ComponentPropsWithoutRef<"div"> {
  size?: CalendarSizeType;
  mode?: CalendarModeType; //. if you want to put a condition on each Module
  page?: CalendarPageType; // If you want to put a condition on each page
}
const Calendar = ({ size = CALENDAR_SIZE.SMALL }: CalendarProps) => {
  const today = dayjs(); // Temporary value, Please manage this globally
  const [currentDate, setCurrentDate] = useState<Dayjs>(today); // Temporary value,
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
        <HeaderGrid
          size={size}
          setCurrentDate={setCurrentDate}
          currentDate={currentDate}
        />
        <CalendarDays size={size} />
        <CalendarBody size={size} currentDate={currentDate} />
        {/* {props.children}  lf you want.*/}
      </div>
    </div>
  );
};

export default Calendar;
