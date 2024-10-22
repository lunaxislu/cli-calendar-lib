import React, { useCallback, useMemo, useState } from "react";
import dayjs, { ConfigType, Dayjs } from "dayjs";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "./utils";
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
const svgVariance = cva("fill-none", {
  variants: {
    nav_button_svg: {
      sm: "w-5 h-5",
      lg: "w-9 h-9",
    },
    nav_button_svg_path: {
      sm: "stroke-[#5C5C5C] stroke-2 group-hover:stroke-white",
      lg: "stroke-black stroke-[3]",
    },
  },
});
const buttonVariance = cva(
  "p-0 m-0 bg-transparent border-none outline-none appearance-none  focus:outline-none cursor-pointer",
  {
    variants: {
      nav_button: {
        sm: "flex w-7 justify-center items-center rounded-lg hover:bg-neutral-900 transition-colors duration-500 group",
        lg: "w-14 h-14 rounded-[12px] opacity-50 bg-gray-300 hover:transition-opacity hover:duration-500 hover:opacity-100 flex justify-center items-center",
      },
      cell_button: {
        sm: "",
        lg: "text-sm",
      },
    },
  },
);
const calendarVariance = cva("", {
  variants: {
    calendar_grid: {
      sm: "grid grid-cols-[max-content] w-[max-content] gap-y-3 p-4 bg-black grid-rows-[1fr_1fr_auto] rounded-xl border-2 border-[#bbb] text-white",
      lg: "grid grid-rows-[1fr_auto_auto] grid-cols-[max-content] w-[max-content] bg-black border-[#bbb] text-white p-6 rounded-2xl border-4",
    },
    nav_row: {
      sm: "flex justify-center relative",
      lg: "flex flex-col items-start text-2xl",
    },
    nav_button_container: {
      sm: "absolute inset-0 flex justify-between",
      lg: "mt-4 flex gap-2 pb-2 border-b border-gray-300",
    },

    days_row: {
      sm: "grid grid-cols-7 place-content-center gap-x-[10px] justify-items-center text-xs font-bold text-[#A1A1AA]",
      lg: "mt-6 grid auto-rows-auto grid-cols-7 justify-items-start gap-6 text-lg",
    },
    day_value: {
      sm: "",
      lg: "",
    },
    table: {
      sm: "grid grid-cols-7 gap-y-[14px] gap-x-[10px] text-sm",
      lg: "mt-6 grid grid-cols-7 justify-items-start gap-x-6 gap-y-[14px]",
    },
  },
});
const cellVariance = cva("", {
  variants: {
    cell: {
      sm: "relative flex justify-center w-8 h-8 rounded-[10px] opacity-50 cursor-pointer hover:transition-colors hover:duration-[0.3s] hover:bg-neutral-900 hover:text-[#bbb]",
      lg: "flex flex-col gap-2 w-[76px] h-[76px] items-start cursor-pointer opacity-50 p-1 rounded-xl hover:transition-opacity hover:duration-[0.2s] hover:opacity-70 hover:text-white hover:bg-[#404045]",
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
      sm: "w-0 overflow-hidden after:content-[''] after:absolute after:top-1 after:right-1 after:w-1 after:h-1 after:rounded-full after:bg-[#ff6600]",
      lg: "w-full h-full text-sm pl-1 overflow-hidden text-start text-ellipsis whitespace-nowrap",
    },
  },
  compoundVariants: [
    {
      cell: "sm",
      cell_isSameMonth: true,
      className: "opacity-100",
    },
    {
      cell_isToday: true,
      className: "bg-[#27272A] opacity-100",
    },
    {
      cell_isSelectDay: true,
      className:
        "bg-white text-black opacity-100 hover:transition-none hover:bg-white hover:text-black hover:opacity-100",
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
      className={cn(
        calendarVariance({
          calendar_grid: size,
          // calendar_grid
          className: classNames?.[`${size}_calendar_grid`],
        }),
      )}
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
  currentDate: Dayjs;
  classNames?: ClassNames;
  clickPreMonthHandler: () => void;
  clickNextMonthHandler: () => void;
  size: "sm" | "lg";
}) {
  return (
    // nav_row
    <nav
      className={cn(
        calendarVariance({ nav_row: size }),
        classNames?.[`${size}_nav_row`],
      )}
    >
      {currentDate.format("MMMM YYYY")}
      {/**nav_button_container*/}
      <div
        className={cn(
          calendarVariance({ nav_button_container: size }),
          classNames?.[`${size}_nav_button_container`],
        )}
      >
        {/* nav_button  */}
        <button
          className={cn(
            buttonVariance({ nav_button: size }),
            classNames?.[`${size}_nav_button`],
          )}
          type="button"
          onClick={clickPreMonthHandler}
        >
          {/* nav_button_svg */}
          <ArrowLeft classNames={classNames} size={size} />
        </button>
        {/* nav_button */}
        <button
          className={cn(
            buttonVariance({ nav_button: size }),
            classNames?.[`${size}_nav_button`],
          )}
          type="button"
          onClick={clickNextMonthHandler}
        >
          {/* nav_button_svg */}
          <ArrowRight classNames={classNames} size={size} />
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
    <header
      className={cn(
        calendarVariance({
          days_row: size,
        }),
        // days_row
        classNames?.[`${size}_days_row`],
      )}
    >
      {WEEK_DAYS.map((day) => (
        <span
          key={day}
          className={cn(
            // day_value
            calendarVariance({ day_value: size }),
            classNames?.[`${size}_day_value`],
          )}
        >
          {dayjs()
            .day(day)
            .format(size === "sm" ? "dd" : "ddd")}
        </span>
      ))}
    </header>
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
      className={cn(
        calendarVariance({ table: size }),
        classNames?.[`${size}_table`],
      )}
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
  const generateCellClasses = cn(
    cellVariance({
      cell: size,
      cell_isSameMonth: isSameMonth,
      cell_isToday: isToday,
      cell_isSelectDay: selectDay?.isSame(day, "day"),
    }),
    classNames?.[`${size}_cell`],
    isSameMonth && classNames?.[`${size}_cell_isSameMonth`],
    selectDay?.isSame(day, "day") && classNames?.[`${size}_cell_isSelectDay`],
    isToday && classNames?.[`${size}_cell_isToday`],
  );
  const renderValueItems = (val: FormattedDateItem<T>) =>
    Object.entries(val).map(([key, value]) => (
      <React.Fragment key={`${key}+${value}`}>
        {key} : {value}
        <br />
      </React.Fragment>
    ));
  return (
    <li onClick={handleClick} className={generateCellClasses}>
      <button
        type="button"
        className={cn(
          buttonVariance({ cell_button: size }),
          classNames?.[`${size}_cell_button`],
        )}
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
      className={cn(
        svgVariance({ nav_button_svg: size }),
        classNames?.[`${size}_nav_button_svg`],
      )}
      viewBox="0 0 35 35"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="arrow-left">
        <path
          id="Vector"
          d="M21.5 25.5L13.5 18L21.5 10.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            svgVariance({ nav_button_svg_path: size }),
            classNames?.[`${size}_nav_button_svg_path`],
          )}
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
      className={cn(
        svgVariance({ nav_button_svg: size }),
        classNames?.[`${size}_nav_button_svg`],
      )}
      viewBox="0 0 35 35"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="arrow-right">
        <path
          id="Vector"
          d="M13.5 25.5L21.5 18L13.5 10.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            svgVariance({ nav_button_svg_path: size }),
            classNames?.[`${size}_nav_button_svg_path`],
          )}
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
        `\nInvalid date: ${cur.date}.\nThe year in the date string should probably have at least 3 digits.\n(e.g. 'YYYY')`,
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
