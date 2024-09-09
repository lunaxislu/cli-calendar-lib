import clsx from "clsx";
import dayjs from "dayjs";
import styles from "./headerGrid.module.css";
import { CALENDAR_SIZE, MONTH_FORMAT, YEAR_FORMAT } from "../const/const";
import HeaderController from "./HeaderController";
import React, { useMemo } from "react";
const HeaderGrid = ({ size }: { size: CalendarSizeType }) => {
  const currentData = dayjs();

  const gridClasses = useMemo(
    () =>
      clsx(styles["base-grid"], {
        [styles["sm-grid"]]: size === CALENDAR_SIZE.SMALL,
        [styles["lg-grid"]]: size === CALENDAR_SIZE.LARGE,
      }),
    [size],
  );

  const txtClasses = useMemo(
    () =>
      clsx({
        [styles["sm-txt"]]: size === CALENDAR_SIZE.SMALL,
        [styles["lg-txt"]]: size === CALENDAR_SIZE.LARGE,
      }),
    [size],
  );
  return (
    <div className={gridClasses}>
      <p className={styles["base-ph"]}>
        <span className={txtClasses}>{currentData.format(YEAR_FORMAT)}</span>
        {currentData.format(MONTH_FORMAT)}
      </p>
      <HeaderController size={size} />
    </div>
  );
};

export default React.memo(HeaderGrid);
