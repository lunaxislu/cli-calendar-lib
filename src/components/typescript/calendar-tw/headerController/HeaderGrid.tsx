import clsx from "clsx";
import { Dayjs } from "dayjs";
import { CALENDAR_SIZE, MONTH_FORMAT, YEAR_FORMAT } from "../const/const";
import HeaderController from "./HeaderController";
import React, { Dispatch, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { CalendarSizeType } from "../types/Calendar";

const HeaderGrid = ({
  size,
  currentDate,
  setCurrentDate,
}: {
  size: CalendarSizeType;
  currentDate: Dayjs;
  setCurrentDate: Dispatch<Dayjs>;
}) => {
  const gridClasses = useMemo(
    () =>
      clsx({
        "flex w-full items-center border-b border-white mb-2 pb-[2px]": true,
        "relative justify-center": size === CALENDAR_SIZE.SMALL,
        "w-[160px] gap-[20px] flex-col items-start":
          size === CALENDAR_SIZE.LARGE,
      }),
    [size],
  );

  const txtClasses = useMemo(
    () =>
      clsx({
        "leading-[18px] text-[18px] font-bold": size === CALENDAR_SIZE.SMALL,
        "text-[20px] font-bold leading-[18px]": size === CALENDAR_SIZE.LARGE,
      }),
    [size],
  );

  return (
    <div className={twMerge(gridClasses)}>
      <p className="m-0 flex gap-[10px] text-[#121416] text-[14px] font-bold leading-[18px] tracking-[-0.36px]">
        <span className={twMerge(txtClasses)}>
          {currentDate.format(YEAR_FORMAT)}
        </span>
        {currentDate.format(MONTH_FORMAT)}
      </p>
      {/** Controller */}
      <HeaderController
        size={size}
        setCurrentDate={setCurrentDate}
        currentDate={currentDate}
      />
    </div>
  );
};

export default React.memo(HeaderGrid);
