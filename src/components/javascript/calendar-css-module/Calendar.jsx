import React, { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import styles from "./calendar.module.css";
import { cva } from "class-variance-authority";

const DISPLAY_FORMAT = "YYYY. MM. DD";
const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6];

const svgCVA = cva(styles["svg-base-reset"], {
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
const buttonCVA = cva(styles["button-base-reset"], {
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
const CalendarCVA = cva(styles["base-style"], {
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

const CellCVA = cva("", {
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
const Calendar = ({
  defaultDate,
  defaultSetDate,
  defaultSelectDate,
  classNames,
  defaultSetSelectDate,
  onClickHandler,
  size = "sm",
  render,
  values,
  cellDateFormat = "D", // 기본 날짜 렌더링 포맷
}) => {
  const [currentDate, setCurrentDate] = useState(defaultDate ?? dayjs());
  const [selectDay, setSelectDay] = useState(defaultSelectDate ?? null);
  const setUpdateDate = defaultSetDate ?? setCurrentDate;
  const setUpdateSelectDate = defaultSetSelectDate ?? setSelectDay;
  const displayValues = useMemo(() => formattedByDate(values ?? []), [values]);
  const clickPreMonthHandler = useCallback(() => {
    setUpdateDate(currentDate.subtract(1, "month"));
  }, [currentDate, setUpdateDate]);

  const clickNextMonthHandler = useCallback(() => {
    setUpdateDate(currentDate.add(1, "month"));
  }, [currentDate, setUpdateDate]);

  const defaultOnClickHandler = useCallback(
    (value) => {
      if (!values) return;
      console.log("value : ", value);
    },
    [values],
  );
  const onClickDayHandler = onClickHandler ?? defaultOnClickHandler;
  const onChangeSelectDay = useCallback(
    (day) => {
      setUpdateSelectDate(selectDay?.isSame(day, "d") ? null : day);
    },

    [selectDay, setUpdateSelectDate],
  );

  return (
    <div
      className={CalendarCVA({
        calendar_grid: size,
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
        selectDay={selectDay}
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
}) {
  return (
    <nav
      className={CalendarCVA({
        nav_row: size,
        className: classNames?.[`${size}_nav_row`],
      })}
    >
      {currentDate.format("MMMM YYYY")}
      <div
        className={CalendarCVA({
          nav_button_container: size,
          className: classNames?.[`${size}_nav_button_container`],
        })}
      >
        <button
          className={buttonCVA({
            nav_button: size,
            className: classNames?.[`${size}_nav_button`],
          })}
          type="button"
          onClick={clickPreMonthHandler}
        >
          <ArrowLeft size={size} classNames={classNames} />
        </button>
        <button
          className={buttonCVA({
            nav_button: size,
            className: classNames?.[`${size}_nav_button`],
          })}
          type="button"
          onClick={clickNextMonthHandler}
        >
          <ArrowRight size={size} classNames={classNames} />
        </button>
      </div>
    </nav>
  );
});

const HeadCompo = React.memo(function Days({ size, classNames }) {
  return (
    <div
      className={CalendarCVA({
        days_row: size,
        className: classNames?.[`${size}_days_row`],
      })}
    >
      {WEEK_DAYS.map((day) => (
        <span key={day} className={classNames?.[`${size}_day_value`]}>
          {dayjs()
            .day(day)
            .format(size === "sm" ? "dd" : "ddd")}
        </span>
      ))}
    </div>
  );
});

const TableCompo = function TableCompo({
  currentDate,
  selectDay,
  size,
  classNames,
  onChangeSelectDay,
  displayValues,
  onClickDayHandler,
  render,
  cellDateFormat,
}) {
  const startDay = currentDate.startOf("month").startOf("week");
  const endDay = currentDate.endOf("month").endOf("week");
  const today = dayjs();
  const dates = [];
  let day = startDay;

  while (day <= endDay) {
    for (let i = 0; i < 7; i++) {
      const itemKey = day.format(DISPLAY_FORMAT);
      const isToday = day.isSame(today, "D");
      const isSameMonth = day.isSame(currentDate, "month");
      const value = displayValues?.get(itemKey) || [];

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
      className={CalendarCVA({
        table: size,
        className: classNames?.[`${size}_table`],
      })}
    >
      {dates}
    </ul>
  );
};

const Cell = function Cell({
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
}) {
  const handleClick = () => {
    onChangeSelectDay(day);
    if (value.length > 0) onClickDayHandler?.(value);
  };

  const generateCellClasses = () =>
    [
      CellCVA({
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

  const renderValueItems = (val) =>
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
        className={buttonCVA({
          cell_button: size,
          className: classNames?.[`${size}_cell_button`],
        })}
      >
        {day.format(cellDateFormat)}
      </button>

      {value.length > 0 && (
        <p
          className={CellCVA({
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

const ArrowLeft = React.memo(function ArrowLeft({ size, classNames }) {
  return (
    <svg
      className={svgCVA({
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
          className={svgCVA({
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

const ArrowRight = React.memo(function ArrowRight({ size, classNames }) {
  return (
    <svg
      className={svgCVA({
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
          className={svgCVA({
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
function formattedByDate(array, format = DISPLAY_FORMAT) {
  if (array.length === 0) return null;
  return array.reduce((acc, cur) => {
    if (!cur.date)
      throw new Error(
        `Invalid date: ${cur.date}. Date cannot be null or undefined.`,
      );
    const dateKey = isValidDate(cur.date, format);

    if (!dateKey) {
      throw new Error(`Invalid date: ${cur.date}`);
    }

    const newCur = { ...cur, date: dateKey };
    const existingGroup = acc.get(dateKey) ?? [];
    acc.set(dateKey, [...existingGroup, newCur]);

    return acc;
  }, new Map());
}

function isValidDate(date, format = DISPLAY_FORMAT) {
  if (typeof date === "number") {
    const parsedDate = date > 9999999999 ? dayjs(date) : dayjs.unix(date);
    return parsedDate.isValid() ? parsedDate.format(format) : null;
  }
  const parsedDate = dayjs(date);
  return parsedDate.isValid() ? parsedDate.format(format) : null;
}
export { Calendar };
