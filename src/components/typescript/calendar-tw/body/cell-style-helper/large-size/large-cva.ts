import { cva } from "class-variance-authority";
/**
 * @explain BASE GRID
 */
const BASE_GRID =
  "grid h-[130px] gap-[10px] grid-rows-[repeat(2,auto)] justify-items-start text-[14px] cursor-default";

// big Mode Variant
const bigCalendarDateStyle = cva(BASE_GRID, {
  variants: {
    /**
     * @explain monthMembership: Indicates whether the date belongs to the current month.
     *
     * IN_CURRENT_MONTH: Date within the current month
     * OUTSIDE_CURRENT_MONTH: Date in the previous or next month
     */
    monthMembership: {
      IN_CURRENT_MONTH: "opacity-100", // Date in the current month
      OUTSIDE_CURRENT_MONTH: "invisible bg-[#ffa800]", // Date in another month
    },

    /**
     * @explain
     * dateRelativeToToday: Styles based on the relationship of the date to today.
     * BEFORE_TODAY: Date before today
     * TODAY: Today's date
     * AFTER_TODAY: Date after today
     */
    dateRelativeToToday: {
      BEFORE_TODAY: "opacity-50", // Date before today
      //Adjust to padding instead of width of the TODAY
      TODAY:
        "relative opacity-100 after:content-['오늘'] after:absolute after:flex after:justify-center after:items-center after:top-[-3px] after:left-[40px] after:bg-[#ffa800] after:text-white after:rounded-full after:px-[10px] after:[w-28px] after:[h-28px] after:[p-4px]", // Today's date
      AFTER_TODAY: "opacity-50", // Date after today
    },
  },
});

export { bigCalendarDateStyle };
