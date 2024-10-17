import React, { useCallback, useState } from "react";
import dayjs from "dayjs";
import styles from "./calendar.module.css";
import { cva } from "class-variance-authority";

const DAYS = [0, 1, 2, 3, 4, 5, 6];

const svgCVA = cva(styles["svg-base-reset"], {
  variants: {
    svg: {
      sm: styles["sm-nav-svg"],
      lg: styles["lg-nav-svg"],
    },
    path: {
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
    size: {
      sm: styles["sm-calendar-grid"],
      lg: styles["lg-calendar-grid"],
    },
    nav: {
      sm: styles["sm-nav-grid"],
      lg: styles["lg-nav-grid"],
    },

    nav_button_container: {
      sm: styles["sm-nav-button-container"],
      lg: styles["lg-nav-button-container"],
    },

    header: {
      sm: styles["sm-head-grid"],
      lg: styles["lg-head-grid"],
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
    isSameMonth: {
      true: "",
    },
    isSelectDay: {
      true: "",
    },
    isToday: {
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
      isSameMonth: true,
      className: styles["sm-sameMonth"],
    },
    {
      cell: "sm",
      isSelectDay: true,
      className: styles["sm-selectDay"],
    },
    {
      cell: "sm",
      isToday: true,
      className: styles["sm-today"],
    },
    {
      cell: "lg",
      isToday: true,
      className: styles["lg-today"],
    },
    {
      cell: "lg",
      isSelectDay: true,
      className: styles["lg-selectDay"],
    },
  ],
});
const Calendar = ({
  defaultDate,
  defaultSetDate,
  defaultSelectDate,
  defaultSetSelectDate,
  onClickHandler,
  size = "sm",
  render,
  contents,
  identiFormat = "YYYY. MM. DD", // 기본 포맷 제공
  cellDateFormat = "D", // 기본 날짜 렌더링 포맷
}) => {
  const [currentDate, setCurrentDate] = useState(defaultDate ?? dayjs());
  const [selectDay, setSelectDay] = useState(defaultSelectDate ?? null);
  const setUpdateDate = defaultSetDate ?? setCurrentDate;
  const setUpdateSelectDate = defaultSetSelectDate ?? setSelectDay;

  const clickPreMonthHandler = useCallback(() => {
    setUpdateDate(currentDate.subtract(1, "month"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const clickNextMonthHandler = useCallback(() => {
    setUpdateDate(currentDate.add(1, "month"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const defaultOnClickHandler = (values, key) => {
    if (!values) return;
    const value = values.get(key);
    console.log("value : ", value);
  };
  const onClickDayHandler = onClickHandler ?? defaultOnClickHandler;
  const onChangeSelectDay = useCallback(
    (day) => {
      setUpdateSelectDate(selectDay?.isSame(day, "d") ? null : day);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectDay],
  );

  return (
    <div className={CalendarCVA({ size })}>
      <NavCompo
        size={size}
        currentDate={currentDate}
        clickPreMonthHandler={clickPreMonthHandler}
        clickNextMonthHandler={clickNextMonthHandler}
      />
      <HeadCompo size={size} />
      <TableCompo
        contents={contents}
        size={size}
        currentDate={currentDate}
        selectDay={selectDay}
        onClickDayHandler={onClickDayHandler}
        onChangeSelectDay={onChangeSelectDay}
        render={render}
        identiFormat={identiFormat}
        cellDateFormat={cellDateFormat}
      />
    </div>
  );
};

function NavCompo({
  currentDate,
  clickPreMonthHandler,
  clickNextMonthHandler,
  size,
}) {
  return (
    <nav className={CalendarCVA({ nav: size })}>
      {currentDate.format("MMMM YYYY")}
      <div className={CalendarCVA({ nav_button_container: size })}>
        <button
          className={buttonCVA({ nav_button: size })}
          type="button"
          onClick={clickPreMonthHandler}
        >
          <ArrowLeft size={size} />
        </button>
        <button
          className={buttonCVA({ nav_button: size })}
          type="button"
          onClick={clickNextMonthHandler}
        >
          <ArrowRight size={size} />
        </button>
      </div>
    </nav>
  );
}

const HeadCompo = React.memo(function Days({ size }) {
  return (
    <div className={CalendarCVA({ header: size })}>
      {DAYS.map((day) => (
        <span key={day}>
          {dayjs()
            .day(day)
            .format(size === "sm" ? "dd" : "ddd")}
        </span>
      ))}
    </div>
  );
});

function TableCompo({
  currentDate,
  selectDay,
  size,
  onChangeSelectDay,
  contents,
  onClickDayHandler,
  render,
  identiFormat,
  cellDateFormat,
}) {
  const startDay = currentDate.startOf("month").startOf("week");
  const endDay = currentDate.endOf("month").endOf("week");
  const today = dayjs();
  const dates = [];
  let day = startDay;

  while (day <= endDay) {
    for (let i = 0; i < 7; i++) {
      const itemKey = day.format(contents?.format ?? identiFormat);
      const isToday = day.isSame(today, "D");
      const isSameMonth = day.isSame(currentDate, "month");
      const value = contents?.values?.get(itemKey) || [];

      dates.push(
        render ? (
          render({
            currentDate,
            selectDay,
            day,
            size,
            value,
            cellDateFormat,
            itemKey,
          })
        ) : (
          <li
            data-id={itemKey}
            key={`${itemKey}-${i}`}
            className={CellCVA({
              cell: size,
              isSameMonth: isSameMonth,
              isSelectDay: selectDay?.isSame(day, "day"),
              isToday: isToday,
            })}
          >
            <button type="button" className={buttonCVA({ cell_button: size })}>
              {day.format(cellDateFormat)}
            </button>

            {value.length > 0 && (
              <p className={CellCVA({ cell_value: size })}>
                {value.map((val) =>
                  Object.entries(val).map(([key, value]) => (
                    <React.Fragment key={`${key}+${value}`}>
                      {key} : {value}
                      <br />
                    </React.Fragment>
                  )),
                )}
              </p>
            )}
          </li>
        ),
      );
      day = day.add(1, "day");
    }
  }
  return (
    <ul
      className={CalendarCVA({ table: size })}
      onClick={(e) => {
        const target = e.target;
        if (target instanceof HTMLUListElement) return;

        const targetLi = target.closest("li");
        if (!targetLi) return;
        const parsedDay = dayjs(
          targetLi.dataset.id,
          contents?.format ?? identiFormat,
        );
        onChangeSelectDay(parsedDay);

        if (
          !contents?.values ||
          !contents.values.get(
            parsedDay.format(contents?.format ?? identiFormat),
          )
        )
          return;

        onClickDayHandler(
          contents?.values,
          parsedDay.format(contents?.format ?? identiFormat),
        );
      }}
    >
      {dates}
    </ul>
  );
}

const ArrowLeft = React.memo(function ArrowLeft({ size }) {
  return (
    <svg
      className={svgCVA({ svg: size })}
      viewBox="0 0 35 35"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="arrow-left">
        <path
          id="Vector"
          d="M21.5 25.5L13.5 18L21.5 10.5"
          className={svgCVA({ path: size })}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
});

const ArrowRight = React.memo(function ArrowRight({ size }) {
  return (
    <svg
      className={svgCVA({ svg: size })}
      viewBox="0 0 35 35"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="arrow-right">
        <path
          id="Vector"
          d="M13.5 25.5L21.5 18L13.5 10.5"
          className={svgCVA({ path: size })}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
});

export { Calendar };
