import React, { useCallback, useMemo, useState } from "react";
import dayjs, { ConfigType, Dayjs } from "dayjs";
import styles from "./calendar.module.css";
import { cva, VariantProps } from "class-variance-authority";
type DateItem = { date: ConfigType };
type FormattedDateItem<T extends DateItem> = Omit<T, "date"> & {
  date: string;
};
type CalendarValues<T extends DateItem> = Map<
  dayjs.FormatObject["format"],
  FormattedDateItem<T>[]
>;
type CalendarStyles = VariantProps<typeof calendarVariance> &
  VariantProps<typeof cellVariance> &
  VariantProps<typeof svgVariance> &
  VariantProps<typeof buttonVariance>;
type ClassNames = Partial<{
  [K in keyof CalendarStyles as `sm_${K}` | `lg_${K}`]: string;
}>;
type GroupedDateItems<T extends DateItem> = CalendarValues<T>;
// Dispatch : Redux, setState, Recoid, zustand, others...
type StateSetter<T> =
  | React.Dispatch<React.SetStateAction<T>>
  | ((value: T) => void);

const DISPLAY_FORMAT = "YYYY. MM. DD";
const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6];

const svgVariance = cva(styles["svg-base-reset"], {
  variants: {
    nav_button_svg: {
      sm: styles["sm-nav-svg"],
      lg: styles["lg-nav-svg"],
    },
    nav_button_svg_path: {
      sm: styles["sm-nav-svg-path"],
      lg: styles["lg-nav-svg-path"],
    },
  },
});
const buttonVariance = cva(styles["button-base-reset"], {
  variants: {
    nav_button: {
      sm: styles["sm-nav-button"],
      lg: styles["lg-nav-button"],
    },
    cell_button: {
      sm: "",
      lg: styles["lg-cell-button"],
    },
  },
});
const calendarVariance = cva(styles["base-style"], {
  variants: {
    calendar_grid: {
      sm: styles["sm-calendar-grid"],
      lg: styles["lg-calendar-grid"],
    },
    nav_row: {
      sm: styles["sm-nav-grid"],
      lg: styles["lg-nav-grid"],
    },

    nav_button_container: {
      sm: styles["sm-nav-button-container"],
      lg: styles["lg-nav-button-container"],
    },

    days_row: {
      sm: styles["sm-head-grid"],
      lg: styles["lg-head-grid"],
    },
    day_value: {
      sm: "",
      lg: "",
    },
    table: {
      sm: styles["sm-table-grid"],
      lg: styles["lg-table-grid"],
    },
  },
});
const cellVariance = cva("", {
  variants: {
    cell: {
      sm: styles["sm-cell"],
      lg: styles["lg-cell"],
    },
    cell_isSameMonth: {
      true: "",
    },
    cell_isSelectDay: {
      true: "",
    },
    cell_isToday: {
      true: "",
    },
    cell_value: {
      sm: styles["sm-cell-value"],
      lg: styles["lg-cell-value"],
    },
  },
  compoundVariants: [
    {
      cell: "sm",
      cell_isSameMonth: true,
      className: styles["sm-sameMonth"],
    },
    {
      cell: "sm",
      cell_isSelectDay: true,
      className: styles["sm-selectDay"],
    },
    {
      cell: "sm",
      cell_isToday: true,
      className: styles["sm-today"],
    },
    {
      cell: "lg",
      cell_isToday: true,
      className: styles["lg-today"],
    },
    {
      cell: "lg",
      cell_isSelectDay: true,
      className: styles["lg-selectDay"],
    },
  ],
});
/**
 * 
 * @param defaultSetDate
 * @param defaultSetSelectDate
 * @example Redux,setState, ... other...
 * const dispatch = useDispatch();
  const if_Use_Redux = (value:Dayjs)=>dispatch(setState(value))
   <Calendar
        defaultSetDate={if_Use_Redux}
        defaultSetSelectDate={if_Use_Redux}
      />
 * @returns 
 */
const Calendar = <T extends DateItem>({
  defaultDate,
  defaultSelectDate,
  defaultSetDate,
  defaultSetSelectDate,
  classNames,
  onClickHandler,
  size = "sm",
  render,
  values,
  cellDateFormat = "D", // default Render Cell Format
}: {
  defaultDate?: dayjs.Dayjs;
  defaultSelectDate?: dayjs.Dayjs | null;
  defaultSetDate?: StateSetter<Dayjs>;
  defaultSetSelectDate?: StateSetter<Dayjs | null>;
  onClickHandler?: (value: FormattedDateItem<T>[]) => void;
  classNames?: ClassNames;
  size?: "sm" | "lg";
  values?: T[];
  cellDateFormat?: string;
  render?: (props: {
    selectDay: Dayjs | null;
    day: Dayjs;
    size: "sm" | "lg";
    value: FormattedDateItem<T>[] | [];
    cellDateFormat: string;
    isToday: boolean;
    isSameMonth: boolean;
    onChangeSelectDay: (day: Dayjs) => void;
    onClickDayHandler?: (value: FormattedDateItem<T>[]) => void;
    classNames?: ClassNames;
  }) => JSX.Element;
}) => {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [originSelectDate, setOriginSelectDate] = useState<Dayjs | null>(null);
  const currentDate = defaultDate ?? date;
  const selectDate =
    defaultSelectDate !== undefined ? defaultSelectDate : originSelectDate;
  const setUpdateDate = defaultSetDate ?? setDate;

  const setUpdateSelectDate = defaultSetSelectDate ?? setOriginSelectDate;
  const displayValues = useMemo(() => formattedByDate(values ?? []), [values]);
  const clickPreMonthHandler = useCallback(() => {
    setUpdateDate(currentDate.subtract(1, "month"));
  }, [currentDate, setUpdateDate]);

  const clickNextMonthHandler = useCallback(() => {
    setUpdateDate(currentDate.add(1, "month"));
  }, [currentDate, setUpdateDate]);

  const defaultOnClickHandler = useCallback(
    (value: FormattedDateItem<T>[]) => {
      if (!values) return;
      console.log("value : ", value);
    },
    [values],
  );
  const onClickDayHandler = onClickHandler ?? defaultOnClickHandler;
  const onChangeSelectDay = useCallback(
    (day: Dayjs) => {
      setUpdateSelectDate(selectDate?.isSame(day, "d") ? null : day);
    },
    [selectDate, setUpdateSelectDate],
  );

  return (
    <div
      className={calendarVariance({
        calendar_grid: size,
        // calendar_grid
        className: classNames?.[`${size}_calendar_grid`],
      })}
    >
      <NavCompo
        classNames={classNames}
        size={size}
        currentDate={currentDate}
        clickPreMonthHandler={clickPreMonthHandler}
        clickNextMonthHandler={clickNextMonthHandler}
      />
      <HeadCompo size={size} classNames={classNames} />
      <TableCompo
        displayValues={displayValues}
        classNames={classNames}
        size={size}
        currentDate={currentDate}
        selectDay={selectDate}
        onClickDayHandler={onClickDayHandler}
        onChangeSelectDay={onChangeSelectDay}
        render={render}
        cellDateFormat={cellDateFormat}
      />
    </div>
  );
};

const NavCompo = React.memo(function NavCompo({
  currentDate,
  clickPreMonthHandler,
  clickNextMonthHandler,
  classNames,
  size,
}: {
  classNames?: ClassNames;
  currentDate: Dayjs;
  clickPreMonthHandler: () => void;
  clickNextMonthHandler: () => void;
  size: "sm" | "lg";
}) {
  return (
    // nav_row
    <nav
      className={calendarVariance({
        nav_row: size,
        className: classNames?.[`${size}_nav_row`],
      })}
    >
      {currentDate.format("MMMM YYYY")}
      {/**nav_button_container*/}
      <div
        className={calendarVariance({
          nav_button_container: size,
          className: classNames?.[`${size}_nav_button_container`],
        })}
      >
        {/* nav_button  */}
        <button
          className={buttonVariance({
            nav_button: size,
            className: classNames?.[`${size}_nav_button`],
          })}
          type="button"
          onClick={clickPreMonthHandler}
        >
          <ArrowLeft size={size} classNames={classNames} />
        </button>
        {/* nav_button */}
        <button
          className={buttonVariance({
            nav_button: size,
            className: classNames?.[`${size}_nav_button`],
          })}
          type="button"
          onClick={clickNextMonthHandler}
        >
          {/* nav_button_svg */}
          <ArrowRight size={size} classNames={classNames} />
        </button>
      </div>
    </nav>
  );
});

const HeadCompo = React.memo(function HeadCompo({
  size,
  classNames,
}: {
  size: "sm" | "lg";
  classNames?: ClassNames;
}) {
  return (
    <div
      className={calendarVariance({
        days_row: size,
        // days_row
        className: classNames?.[`${size}_days_row`],
      })}
    >
      {WEEK_DAYS.map((day) => (
        // day_value
        <span key={day} className={classNames?.[`${size}_day_value`]}>
          {dayjs()
            .day(day)
            .format(size === "sm" ? "dd" : "ddd")}
        </span>
      ))}
    </div>
  );
});

const TableCompo = function TableCompo<T extends DateItem>({
  currentDate,
  selectDay,
  size,
  classNames,
  onChangeSelectDay,
  displayValues,
  onClickDayHandler,
  render,
  cellDateFormat,
}: {
  displayValues: GroupedDateItems<T> | null;
  classNames?: ClassNames;
  currentDate: Dayjs;
  size: "sm" | "lg";
  selectDay: Dayjs | null;
  onChangeSelectDay: (day: Dayjs) => void;
  onClickDayHandler: (value: FormattedDateItem<T>[]) => void;
  cellDateFormat: string;
  render?: (props: {
    selectDay: Dayjs | null;
    day: Dayjs;
    size: "sm" | "lg";
    value: FormattedDateItem<T>[] | [];
    cellDateFormat: string;
    isToday: boolean;
    isSameMonth: boolean;
    onChangeSelectDay: (day: Dayjs) => void;
    onClickDayHandler?: (value: FormattedDateItem<T>[]) => void;
    classNames?: ClassNames;
  }) => JSX.Element;
}) {
  const startDay = currentDate.startOf("month").startOf("week");
  const endDay = currentDate.endOf("month").endOf("week");
  const today = dayjs();
  const dates: JSX.Element[] = [];
  let day = startDay;

  while (day <= endDay) {
    for (let i = 0; i < 7; i++) {
      const itemKey = day.format(DISPLAY_FORMAT);
      const isToday = day.isSame(today, "D");
      const isSameMonth = day.isSame(currentDate, "month");
      const value = displayValues?.get(itemKey as string) || [];

      dates.push(
        render ? (
          render({
            selectDay,
            day,
            size,
            onChangeSelectDay,
            value,
            cellDateFormat,
            isToday,
            isSameMonth,
            classNames,
            onClickDayHandler,
          })
        ) : (
          <Cell
            key={itemKey}
            day={day}
            isToday={isToday}
            isSameMonth={isSameMonth}
            size={size}
            selectDay={selectDay}
            cellDateFormat={cellDateFormat}
            value={value}
            onClickDayHandler={onClickDayHandler}
            onChangeSelectDay={onChangeSelectDay}
            classNames={classNames}
          />
        ),
      );
      day = day.add(1, "day");
    }
  }
  return (
    <ul
      //table
      className={calendarVariance({
        table: size,
        className: classNames?.[`${size}_table`],
      })}
    >
      {dates}
    </ul>
  );
};

const Cell = function Cell<T extends DateItem>({
  selectDay,
  day,
  size,
  value,
  onClickDayHandler,
  onChangeSelectDay,
  cellDateFormat,
  classNames,
  isSameMonth,
  isToday,
}: {
  selectDay: Dayjs | null;
  day: Dayjs;
  size: "sm" | "lg";
  onChangeSelectDay: (day: Dayjs) => void;
  value: FormattedDateItem<T>[] | [];
  cellDateFormat?: string;
  isToday: boolean;
  isSameMonth: boolean;
  classNames?: ClassNames;
  onClickDayHandler?: (value: FormattedDateItem<T>[]) => void;
}) {
  const handleClick = () => {
    onChangeSelectDay(day);
    if (value.length > 0) onClickDayHandler?.(value);
  };

  const generateCellClasses = () =>
    [
      cellVariance({
        cell: size,
        cell_isSameMonth: isSameMonth,
        cell_isSelectDay: selectDay?.isSame(day, "day"),
        cell_isToday: isToday,
      }),
      classNames?.[`${size}_cell`],
      isSameMonth && classNames?.[`${size}_cell_isSameMonth`],
      selectDay?.isSame(day, "day") && classNames?.[`${size}_cell_isSelectDay`],
      isToday && classNames?.[`${size}_cell_isToday`],
    ]
      .filter(Boolean)
      .join(" ");

  const renderValueItems = (val: FormattedDateItem<T>) =>
    Object.entries(val).map(([key, value]) => (
      <React.Fragment key={`${key}+${value}`}>
        {key} : {value}
        <br />
      </React.Fragment>
    ));
  return (
    <li onClick={handleClick} className={generateCellClasses()}>
      <button
        type="button"
        className={buttonVariance({
          cell_button: size,
          className: classNames?.[`${size}_cell_button`],
        })}
      >
        {day.format(cellDateFormat)}
      </button>

      {value.length > 0 && (
        <p
          className={cellVariance({
            cell_value: size,
            className: classNames?.[`${size}_cell_value`],
          })}
        >
          {value.map(renderValueItems)}
        </p>
      )}
    </li>
  );
};

const ArrowLeft = React.memo(function ArrowLeft({
  size,
  classNames,
}: {
  size: "sm" | "lg";
  classNames?: ClassNames;
}) {
  return (
    <svg
      className={svgVariance({
        nav_button_svg: size,
        className: classNames?.[`${size}_nav_button_svg`],
      })}
      viewBox="0 0 35 35"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="arrow-left">
        <path
          id="Vector"
          d="M21.5 25.5L13.5 18L21.5 10.5"
          className={svgVariance({
            nav_button_svg_path: size,
            className: classNames?.[`${size}_nav_button_svg_path`],
          })}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
});

const ArrowRight = React.memo(function ArrowRight({
  size,
  classNames,
}: {
  size: "sm" | "lg";
  classNames?: ClassNames;
}) {
  return (
    <svg
      className={svgVariance({
        nav_button_svg: size,
        className: classNames?.[`${size}_nav_button_svg`],
      })}
      viewBox="0 0 35 35"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="arrow-right">
        <path
          id="Vector"
          d="M13.5 25.5L21.5 18L13.5 10.5"
          className={svgVariance({
            nav_button_svg_path: size,
            className: classNames?.[`${size}_nav_button_svg_path`],
          })}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
});
function formattedByDate<T extends DateItem>(
  array: T[],
  format: string = DISPLAY_FORMAT,
): GroupedDateItems<T> | null {
  if (array.length === 0) return null;
  return array.reduce((acc, cur) => {
    if (!cur.date)
      throw new Error(
        `Invalid date: ${cur.date}. Date cannot be null or undefined.`,
      );
    const dateKey = isValidDate(cur.date, format);

    if (!dateKey) {
      throw new Error(
        `\nInvalid date: ${cur.date}.\nThe year in the date string should have at 4 digits.\n(e.g. 'YYYY....')`,
      );
    }

    const newCur = { ...cur, date: dateKey };
    const existingGroup = acc.get(dateKey) ?? [];
    acc.set(dateKey, [...existingGroup, newCur]);

    return acc;
  }, new Map<dayjs.FormatObject["format"], FormattedDateItem<T>[]>());
}

function isValidDate(
  date: ConfigType,
  format: string = DISPLAY_FORMAT,
): string | null {
  if (typeof date === "number") {
    const parsedDate = date > 9999999999 ? dayjs(date) : dayjs.unix(date);
    return parsedDate.isValid() ? parsedDate.format(format) : null;
  }
  const parsedDate = dayjs(date);
  return parsedDate.isValid() ? parsedDate.format(format) : null;
}
export { Calendar };
