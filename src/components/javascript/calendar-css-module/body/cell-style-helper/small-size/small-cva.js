import { cva } from "class-variance-authority";
import styles from "./small-size-style.module.css";
// Mini mode style
const smallCalendarDateStyle = cva(styles["small-calendar-base-grid"], {
  variants: {
    /**
     * @explain
     * calendarDisplayState: Indicates whether the date belongs to the currently rendered calendar
     *
     * ACTIVE: Date in the currently rendered calendar
     * INACTIVE: Date in the previous or another calendar
     */

    calendarDisplayState: {
      ACTIVE: styles["current-calendar"], // Date in the currently rendered calendar
      INACTIVE: styles["not-current-calendar"], // Date in another calendar
    },
    /**
     * @explain monthMembership: Indicates whether the date belongs to the current month, or the previous/next month
     * IN_CURRENT_MONTH: Date within the current month
     * OUTSIDE_CURRENT_MONTH: Date in the previous or next month
     */

    monthMembership: {
      IN_CURRENT_MONTH: styles["small-current-month"], // Date in the current month
      OUTSIDE_CURRENT_MONTH: styles["small-not-current-month"], // Date in the previous/next month
    },

    /**
     * @explain dateRelativeToToday: Indicates the relationship of the date to today (before, today, after)
     *
     * BEFORE_TODAY: Date before today
     * TODAY: Today's date
     * AFTER_TODAY: Date after today
     */

    dateRelativeToToday: {
      BEFORE_TODAY: styles["small-prev-date"], // Date before today
      TODAY: styles["small-current-date"], // Today's date
      AFTER_TODAY: styles["small-after-date"], // Date after today
    },
  },
});

// Day type style follows the same pattern
const dayStyleVariant = cva(styles["small-day-base"], {
  variants: {
    dayType: {
      SATURDAY: styles["small-calendar-saturday"], // Saturday style
      SUNDAY: styles["small-calendar-sunday"], // Sunday style
      WEEKDAY: styles["small-calendar-day"], // Weekday style
    },

    /**
     * @related to "92Line of ./small-size-style.module.css" & "Cell.tsx"
     * 
     *selectedDay: {  
      SELECTED: styles["small-calendar-selected-date"], // Style for selected date
    },
     */
  },
});

export { smallCalendarDateStyle, dayStyleVariant };
