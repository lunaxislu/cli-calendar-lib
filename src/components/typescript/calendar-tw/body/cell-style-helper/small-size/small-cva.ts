import { cva } from "class-variance-authority";

/**
 * @explain BASE GRID
 */
const BASE_GRID =
  "grid h-[44px] gap-[5px] grid-rows-[repeat(2,auto)] justify-items-center place-content-center text-[14px]"; // if add width, Management Cell width

// Mini mode style
const smallCalendarDateStyle = cva(BASE_GRID, {
  variants: {
    /**
     * @explain
     * calendarDisplayState: Indicates whether the date belongs to the currently rendered calendar
     *
     * ACTIVE: Date in the currently rendered calendar
     * INACTIVE: Date in the previous or another calendar
     */
    calendarDisplayState: {
      ACTIVE: "opacity-100", // Date in the currently rendered calendar
      INACTIVE: "opacity-50 bg-gray-200", // Date in another calendar
    },
    /**
     * @explain monthMembership: Indicates whether the date belongs to the current month, or the previous/next month
     * IN_CURRENT_MONTH: Date within the current month
     * OUTSIDE_CURRENT_MONTH: Date in the previous/next month
     */
    monthMembership: {
      IN_CURRENT_MONTH: "opacity-100", // Date in the current month
      OUTSIDE_CURRENT_MONTH: "opacity-50 bg-gray", // Date in the previous/next month
    },
    /**
     * @explain dateRelativeToToday: Indicates the relationship of the date to today (before, today, after)
     * BEFORE_TODAY: Date before today
     * TODAY: Today's date
     * AFTER_TODAY: Date after today
     */
    dateRelativeToToday: {
      BEFORE_TODAY: " cursor-pointer text-gray-500", // Date before today
      TODAY:
        "cursor-pointer opacity-100 grid place-items-center [&>span]:rounded-full [&>span]:bg-[rgba(255,168,0,0.5)] [&>span]:text-black [&>span]:w-[20px] [&>span]:h-[20px] [&>span]:flex [&>span]:justify-center [&>span]:items-center", // Today's date
      AFTER_TODAY: "opacity-50 pointer-events-none text-gray-400", // Date after today
    },
  },
});

// Day type style follows the same pattern
const dayStyleVariant = cva(
  "grid w-[23px] h-[23px] gap-[10px] justify-items-center items-center",
  {
    variants: {
      /**
       * @explain dayType: Styles for different day types.
       * SATURDAY: Saturday style
       * SUNDAY: Sunday style
       * WEEKDAY: Weekday style
       */
      dayType: {
        SATURDAY: "text-blue-500", // Saturday style
        SUNDAY: "text-red-500", // Sunday style
        WEEKDAY: "text-black", // Weekday style
      },
      /**
       * Please CheckOut Cell.tsx
       * @explain selected Cell style in Small Size Calendar
       * @related to selectedDay: Style for selected date.
       * SELECTED: Style for selected date
       *
       */
      // selectedDay: {
      //   SELECTED:
      //     "flex justify-center items-center w-[25px] h-[25px] rounded-full border border-purple-500 bg-purple-100 text-center",
      // },
    },
  },
);

export { smallCalendarDateStyle, dayStyleVariant };
