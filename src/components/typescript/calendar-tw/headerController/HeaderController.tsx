import clsx from "clsx";
import { CALENDAR_SIZE } from "../const/const";
import { ArrowLeft, ArrowRight } from "../svg/CalendarSvgr";
import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";
const BASE_BTN_CLASSNAME =
  "bg-transparent absolute top-1/2 transform -translate-y-1/2 flex justify-center items-center p-0 cursor-pointer w-[12px]";

const HeaderController = ({ size }: { size: CalendarSizeType }) => {
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

  return (
    <div className={twMerge(conditionalModeClasses)}>
      <button type="button" className={twMerge(conditionalLeftButtonClasses)}>
        <ArrowLeft />
      </button>

      <button type="button" className={twMerge(conditionalRightButtonClasses)}>
        <ArrowRight />
      </button>
    </div>
  );
};

export default React.memo(HeaderController);
