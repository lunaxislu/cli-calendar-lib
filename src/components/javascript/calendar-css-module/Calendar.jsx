import clsx from "clsx";
import styles from "./calendar.module.css";
import { CALENDAR_SIZE } from "./const/const";
import { useMemo, useState } from "react";
import HeaderGrid from "./headerController/HeaderGrid";
import CalendarDays from "./days/CalendarDays";
import CalendarBody from "./body/CalendarBody";
import dayjs from "dayjs";

const Calendar = ({ size = CALENDAR_SIZE.SMALL }) => {
  const today = dayjs(); // Temporary value, Please manage this globally
  const [currentDate, setCurrentDate] = useState(today); // Temporary value, Please manage this globally
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
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
        <CalendarDays size={size} />
        <CalendarBody size={size} currentDate={currentDate} />
        {/* {props.children}  lf you want.*/}
      </div>
    </div>
  );
};

export default Calendar;
