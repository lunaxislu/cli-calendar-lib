import clsx from "clsx";
import { CALENDAR_SIZE } from "../const/const";
import { ArrowLeft, ArrowRight } from "../svg/CalendarSvgr";
import React, { Dispatch, useCallback, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { CalendarSizeType } from "../types/Calendar";
import { Dayjs } from "dayjs";
const BASE_BTN_CLASSNAME =
  "bg-transparent absolute top-1/2 transform -translate-y-1/2 flex justify-center items-center p-0 cursor-pointer w-[12px]";

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
    () =>
      clsx({
        "flex gap-[10px]": size === CALENDAR_SIZE.LARGE,
      }),
    [size],
  );

  const conditionalLeftButtonClasses = useMemo(
    () =>
      clsx(BASE_BTN_CLASSNAME, {
        "w-[22px] left-0": size === CALENDAR_SIZE.SMALL,
        "static flex w-[55px] h-[55px] translate-y-0 p-[10px] m-0 flex-col justify-center items-center gap-[10px] rounded-[8px] bg-gray-100":
          size === CALENDAR_SIZE.LARGE,
      }),
    [size],
  );

  const conditionalRightButtonClasses = useMemo(
    () =>
      clsx(BASE_BTN_CLASSNAME, {
        "w-[22px] right-0": size === CALENDAR_SIZE.SMALL,
        "static flex w-[55px] h-[55px] translate-y-0 p-[10px] m-0 flex-col justify-center items-center gap-[10px] rounded-[8px] bg-gray-100 hover:opacity-80":
          size === CALENDAR_SIZE.LARGE,
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
    <div className={twMerge(conditionalModeClasses)}>
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
