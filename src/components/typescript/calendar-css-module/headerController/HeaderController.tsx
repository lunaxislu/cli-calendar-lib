import clsx from "clsx";
import styles from "./headerController.module.css";
import { CALENDAR_SIZE } from "../const/const";
import { ArrowLeft, ArrowRight } from "../svg/CalendarSvgr";
import React, { Dispatch, useCallback, useMemo } from "react";
import { CalendarSizeType } from "../types/Calendar";
import { Dayjs } from "dayjs";
import { twMerge } from "tailwind-merge";
const HeaderController = ({
  size,
  setCurrentDate,
  currentDate,
}: {
  size: CalendarSizeType;
  setCurrentDate: Dispatch<Dayjs>;
  currentDate: Dayjs;
}) => {
  const conditionalModeClasses = useMemo(
    () => clsx(size === CALENDAR_SIZE.LARGE && styles["lg-grid"]),
    [size],
  );

  const conditionalLeftButtonClasses = useMemo(
    () =>
      clsx(styles["calendar-base-btn"], {
        [styles["sm-btn-left"]]: size === CALENDAR_SIZE.SMALL,
        [styles["lg-calendar-btn"]]: size === CALENDAR_SIZE.LARGE,
      }),
    [size],
  );
  const conditionalRightButtonClasses = useMemo(
    () =>
      clsx(styles["calendar-base-btn"], {
        [styles["sm-btn-right"]]: size === CALENDAR_SIZE.SMALL,
        [styles["lg-calendar-btn"]]: size === CALENDAR_SIZE.LARGE,
      }),
    [size],
  );

  // prev month
  const clickPreMonthHandler = useCallback(() => {
    setCurrentDate(currentDate.subtract(1, "month"));
  }, [currentDate]);
  // next month
  const clickNextMonthHandler = useCallback(() => {
    setCurrentDate(currentDate.add(1, "month"));
  }, [currentDate]);
  return (
    <div className={conditionalModeClasses}>
      <button
        type="button"
        onClick={clickPreMonthHandler}
        className={twMerge(conditionalLeftButtonClasses)}
      >
        <ArrowLeft />
      </button>

      <button
        type="button"
        onClick={clickNextMonthHandler}
        className={twMerge(conditionalRightButtonClasses)}
      >
        <ArrowRight />
      </button>
    </div>
  );
};

export default React.memo(HeaderController);
