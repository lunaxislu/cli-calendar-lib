import dayjs from "dayjs";
import React from "react";
import { FORMAT_BODY_DATE } from "../const/const";
import Cell from "./cell/Cell";
import styles from "./calendar-body.module.css";

const CalendarBody = ({ size, currentDate }) => {
  // The start day of the week that the monthStart belongs to
  const startDay = currentDate.startOf("month").startOf("week");
  // The last week that the monthStart belongs to
  const endDay = currentDate.endOf("month").endOf("week");

  const row = [];
  let days = [];
  let day = startDay;
  while (day <= endDay) {
    for (let i = 0; i < 7; i++) {
      const itemKey = day.format(FORMAT_BODY_DATE);

      days.push(<Cell key={itemKey} size={size} day={day} />);
      day = day.add(1, "day");
    }
    row.push(
      <div key={days[0].key} className={styles["row-grid"]}>
        {days}
      </div>,
    );
    days = [];
  }
  return <div className={styles["container-grid"]}>{row}</div>;
};
export default React.memo(CalendarBody);
