import dayjs from "dayjs";
import React, { HTMLAttributes } from "react";
import { FORMAT_BODY_DATE } from "../const/const";
import Cell from "./cell/Cell";
import { twMerge } from "tailwind-merge";

interface CalendarBodyProps extends HTMLAttributes<"div"> {
  size: CalendarSizeType;
  mode?: CalendarModeType;
  page?: CalendarPageType;
}

const CONTAINER_GRID_CLASSNAME = "flex flex-col items-end w-full";
const ROW_GRID_CLASSNAME = "grid grid-cols-7 gap-[10px] w-full";

const CalendarBody = ({ size }: CalendarBodyProps) => {
  const currentDate = dayjs(); // Temporary value, Please manage this globally!

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
      <div key={days[0].key} className={twMerge(ROW_GRID_CLASSNAME)}>
        {days}
      </div>,
    );
    days = [];
  }
  return <div className={twMerge(CONTAINER_GRID_CLASSNAME)}>{row}</div>;
};

export default React.memo(CalendarBody);
