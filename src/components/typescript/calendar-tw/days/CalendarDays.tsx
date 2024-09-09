import React, { useMemo } from "react";
import { CALENDAR_SIZE, DAYS } from "../const/const";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const rowGridClassName = {
  smRow: "flex items-start justify-between gap-[10px] py-[10px]",
  lgRow: "grid grid-cols-7 gap-[10px] w-full",
};

const colGridClassName = {
  smCol:
    "flex w-[30px] h-[44px] p-[5px_10px_10px_10px] flex-col items-center gap-[5px]",
  lgCol:
    "flex w-full max-w-[150px] pb-[20px] flex-col items-start gap-[10px] text-[#121416] text-[20px] font-semibold leading-[20px] tracking-[-0.4px]",
};

const cellTxtClassName = {
  smallCell:
    "flex w-[23px] h-[23px] flex-col justify-center items-center gap-[10px] flex-shrink-0 text-[15px] text-[#5c5c5c] rounded-full",
};

const CalendarDays = ({ size }: { size: CalendarSizeType }) => {
  const containerGrid = useMemo(
    () => rowGridClassName[size === CALENDAR_SIZE.SMALL ? "smRow" : "lgRow"],
    [size],
  );
  const colGrid = useMemo(
    () => colGridClassName[size === CALENDAR_SIZE.SMALL ? "smCol" : "lgCol"],
    [size],
  );
  const cellTxt = useMemo(
    () => (size === CALENDAR_SIZE.SMALL ? cellTxtClassName.smallCell : null),
    [size],
  );

  return (
    <div className={twMerge(containerGrid)}>
      {DAYS.map((day, idx) => (
        <span key={day + idx} className={twMerge(clsx(colGrid, cellTxt))}>
          {day}
        </span>
      ))}
    </div>
  );
};

export default React.memo(CalendarDays);
