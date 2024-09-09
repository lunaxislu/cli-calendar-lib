import clsx from "clsx";
import { CALENDAR_SIZE } from "./const/const";
import { ComponentPropsWithoutRef, useMemo } from "react";
import HeaderGrid from "./headerController/HeaderGrid";
import CalendarDays from "./days/CalendarDays";
import CalendarBody from "./body/CalendarBody";
import { twMerge } from "tailwind-merge";

interface CalendarProps extends ComponentPropsWithoutRef<"div"> {
  size?: CalendarSizeType;
  mode?: CalendarModeType;
  page?: CalendarPageType;
}
const Calendar = ({ size = CALENDAR_SIZE.SMALL }: CalendarProps) => {
  const calendarGrid = useMemo(
    () =>
      clsx({
        "inline-flex flex-col items-start gap-[10.5px] p-[20px] rounded-[5px] border border-[#ededed] bg-white":
          size === CALENDAR_SIZE.SMALL,
        "flex max-w-[1520px] w-full items-start gap-[40px] justify-between mt-[20px] pb-[50px]":
          size === CALENDAR_SIZE.LARGE,
      }),
    [size],
  );

  const calendarInnerGrid = useMemo(
    () =>
      clsx({
        "flex flex-col w-full justify-center items-center":
          size === CALENDAR_SIZE.SMALL,
        "flex flex-col items-start gap-[20px] w-[78%] max-w-[1260px] p-[30px] rounded-[20px] border border-[#ededed]":
          size === CALENDAR_SIZE.LARGE,
      }),
    [size],
  );

  return (
    <div className={twMerge(calendarGrid)}>
      <div className={twMerge(calendarInnerGrid)}>
        <HeaderGrid size={size} />
        <CalendarDays size={size} />
        <CalendarBody size={size} />
      </div>
    </div>
  );
};

export default Calendar;
