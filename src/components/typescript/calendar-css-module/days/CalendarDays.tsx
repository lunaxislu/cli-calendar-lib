import React, { useMemo } from "react";
import styles from "./days.module.css";
import { CALENDAR_SIZE, DAYS } from "../const/const";
import clsx from "clsx";

const rowClassName = {
  smRow: styles["sm-row-grid"],
  lgRow: styles["lg-row-grid"],
};

const colClassName = {
  smCol: styles["sm-col-grid"],
  lgCol: styles["lg-col-grid"],
};

const cellTxtClassName = {
  smallCell: styles["sm-cell-text"],
};
const CalendarDays = ({ size }: { size: CalendarSizeType }) => {
  const containerGrid = useMemo(
    () => rowClassName[size === CALENDAR_SIZE.SMALL ? "smRow" : "lgRow"],
    [size],
  );
  const colGrid = useMemo(
    () => colClassName[size === CALENDAR_SIZE.SMALL ? "smCol" : "lgCol"],
    [size],
  );
  const cellTxt = useMemo(
    () => (size === CALENDAR_SIZE.SMALL ? cellTxtClassName.smallCell : null),
    [size],
  );

  return (
    <div className={containerGrid}>
      {DAYS.map((day, idx) => (
        <span key={day + idx} className={clsx(colGrid, cellTxt)}>
          {day}
        </span>
      ))}
    </div>
  );
};

export default React.memo(CalendarDays);
