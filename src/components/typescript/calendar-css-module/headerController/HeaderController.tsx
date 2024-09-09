import clsx from "clsx";
import styles from "./headerController.module.css";
import { CALENDAR_SIZE } from "../const/const";
import { ArrowLeft, ArrowRight } from "../svg/CalendarSvgr";
import React, { useMemo } from "react";
const HeaderController = ({ size }: { size: CalendarSizeType }) => {
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
  return (
    <div className={conditionalModeClasses}>
      <button type="button" className={conditionalLeftButtonClasses}>
        <ArrowLeft />
      </button>

      <button type="button" className={conditionalRightButtonClasses}>
        <ArrowRight />
      </button>
    </div>
  );
};

export default React.memo(HeaderController);
