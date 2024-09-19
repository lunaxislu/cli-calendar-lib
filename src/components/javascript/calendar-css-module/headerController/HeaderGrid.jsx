import clsx from "clsx";
import styles from "./headerGrid.module.css";
import { CALENDAR_SIZE, MONTH_FORMAT, YEAR_FORMAT } from "../const/const";
import HeaderController from "./HeaderController";
import React, { useMemo } from "react";
const HeaderGrid = ({ size, currentDate, setCurrentDate }) => {
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
        <span className={txtClasses}>{currentDate.format(YEAR_FORMAT)}</span>
        {currentDate.format(MONTH_FORMAT)}
      </p>
      {/**Controller */}
      <HeaderController
        size={size}
        setCurrentDate={setCurrentDate}
        currentDate={currentDate}
      />
    </div>
  );
};

export default React.memo(HeaderGrid);
