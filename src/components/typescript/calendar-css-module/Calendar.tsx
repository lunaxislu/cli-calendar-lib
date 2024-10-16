import React, { MouseEvent, ReactNode, useCallback, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import styles from "./calendar.module.css";
import { cva } from "class-variance-authority";

const DAYS = [0, 1, 2, 3, 4, 5, 6];
const SVGRStyles = {
  sm: {
    width: "20",
    height: "20",
    stroke: "#5C5C5C",
    strokeWidth: "2",
    fill: "none",
  },
  lg: {
    width: "36",
    height: "36",
    stroke: "#000000",
    strokeWidth: "3",
    fill: "none",
  },
};
const CalendarCVA = cva(styles["baseStyle"], {
  variants: {
    size: {
      sm: styles["sm-calendar-grid"],
      lg: styles["lg-calendar-grid"],
    },
    header: {
      sm: styles["sm-header-grid"],
      lg: styles["lg-header-grid"],
    },

    buttonContainer: {
      sm: styles["sm-button-container"],
      lg: styles["lg-button-container"],
    },
    button: {
      sm: styles["sm-button"],
      lg: styles["lg-button"],
    },
    days: {
      sm: styles["sm-days-grid"],
      lg: styles["lg-days-grid"],
    },
    cellContainer: {
      sm: styles["sm-cell-container-grid"],
      lg: styles["lg-cell-container-grid"],
    },
  },
});

const CellCVA = cva("", {
  variants: {
    size: {
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

    cellBtn: {
      sm: styles["sm-cell-button"],
      lg: styles["lg-cell-button"],
    },
    cellValue: {
      sm: styles["sm-cell-value"],
      lg: styles["lg-cell-value"],
    },
  },
  compoundVariants: [
    {
      size: "sm",
      isSameMonth: true,
      className: styles["sm-sameMonth"],
    },
    {
      size: "sm",
      isSelectDay: true,
      className: styles["sm-selectDay"],
    },
    {
      size: "sm",
      isToday: true,
      className: styles["sm-today"],
    },
    {
      size: "lg",
      isToday: true,
      className: styles["lg-today"],
    },
    {
      size: "lg",
      isSelectDay: true,
      className: styles["lg-selectDay"],
    },
  ],
});
export const Calendar = <T extends { [key: string | number]: ReactNode }>({
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
}: {
  defaultDate?: Dayjs;
  size?: "sm" | "lg";
  contents?: {
    values: Map<dayjs.FormatObject["format"], T[]>;
    format?: string;
  };
  defaultSetDate?: React.Dispatch<React.SetStateAction<Dayjs>>;
  defaultSetSelectDate?: React.Dispatch<React.SetStateAction<Dayjs | null>>;
  defaultSelectDate?: Dayjs | null;
  onClickHandler?: (
    values: Map<dayjs.FormatObject["format"], T[]>,
    key: dayjs.FormatObject["format"],
  ) => void;
  identiFormat?: string;
  cellDateFormat?: string;
  render?: (props: {
    currentDate: Dayjs;
    selectDay: Dayjs | null;
    day: Dayjs;
    value?: T[];
    size: "sm" | "lg";
    cellDateFormat: string;
    itemKey: string;
  }) => JSX.Element;
}) => {
  const [currentDate, setCurrentDate] = useState<Dayjs>(defaultDate ?? dayjs());
  const [selectDay, setSelectDay] = useState<Dayjs | null>(
    defaultSelectDate ?? null,
  );
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

  const defaultOnClickHandler = (
    values: Map<dayjs.FormatObject["format"], T[]>,
    key: dayjs.FormatObject["format"],
  ) => {
    if (!values) return;
    const value = values.get(key);
    console.log("value : ", value);
  };
  const onClickDayHandler = onClickHandler ?? defaultOnClickHandler;
  const onChangeSelectDay = useCallback(
    (day: Dayjs) => {
      setUpdateSelectDate(selectDay?.isSame(day, "d") ? null : day);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectDay],
  );

  return (
    <div className={CalendarCVA({ size })}>
      <Controller
        size={size}
        currentDate={currentDate}
        clickPreMonthHandler={clickPreMonthHandler}
        clickNextMonthHandler={clickNextMonthHandler}
      />
      <Days size={size} />
      <Cells
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

export function Controller({
  currentDate,
  clickPreMonthHandler,
  clickNextMonthHandler,
  size,
}: {
  currentDate: Dayjs;
  clickPreMonthHandler: () => void;
  clickNextMonthHandler: () => void;
  size: "sm" | "lg";
}) {
  return (
    <div className={CalendarCVA({ header: size })}>
      {currentDate.format("MMMM YYYY")}
      <div className={CalendarCVA({ buttonContainer: size })}>
        <button
          className={CalendarCVA({ button: size })}
          type="button"
          onClick={clickPreMonthHandler}
        >
          <ArrowLeft size={size} />
        </button>
        <button
          className={CalendarCVA({ button: size })}
          type="button"
          onClick={clickNextMonthHandler}
        >
          <ArrowRight size={size} />
        </button>
      </div>
    </div>
  );
}

export const Days = React.memo(function Days({ size }: { size: "sm" | "lg" }) {
  return (
    <div className={CalendarCVA({ days: size })}>
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

export function Cells<T extends { [key: string | number]: ReactNode }>({
  currentDate,
  selectDay,
  size,
  onChangeSelectDay,
  contents,
  onClickDayHandler,
  render,
  identiFormat,
  cellDateFormat,
}: {
  currentDate: Dayjs;
  size: "sm" | "lg";
  selectDay: Dayjs | null;
  onChangeSelectDay: (day: Dayjs) => void;
  onClickDayHandler: (
    values: Map<dayjs.FormatObject["format"], T[]>,
    key: dayjs.FormatObject["format"],
  ) => void;
  contents?: {
    values: Map<dayjs.FormatObject["format"], T[]>;
    format?: string;
  };
  render?: (props: {
    currentDate: Dayjs;
    selectDay: Dayjs | null;
    day: Dayjs;
    value?: T[];
    size: "sm" | "lg";
    cellDateFormat: string;
    itemKey: string;
  }) => JSX.Element;

  identiFormat: string;
  cellDateFormat: string;
}) {
  const startDay = currentDate.startOf("month").startOf("week");
  const endDay = currentDate.endOf("month").endOf("week");
  const today = dayjs();
  const dates: JSX.Element[] = [];
  let day = startDay;

  while (day <= endDay) {
    for (let i = 0; i < 7; i++) {
      const itemKey = day.format(contents?.format ?? identiFormat);
      const isToday = day.isSame(today, "D");
      const isSameMonth = day.isSame(currentDate, "month");
      const value = contents?.values?.get(itemKey as string) || [];

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
              size,
              isSameMonth: isSameMonth,
              isSelectDay: selectDay?.isSame(day, "day"),
              isToday: isToday,
            })}
          >
            <button type="button" className={CellCVA({ cellBtn: size })}>
              {day.format(cellDateFormat)}
            </button>

            {value.length > 0 && (
              <p className={CellCVA({ cellValue: size })}>
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
      className={CalendarCVA({ cellContainer: size })}
      onClick={(e: MouseEvent<HTMLUListElement>) => {
        const target = e.target as HTMLElement;
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

export const ArrowLeft = React.memo(function ArrowLeft({
  size,
}: {
  size: "sm" | "lg";
}) {
  const svgProps = SVGRStyles[size];
  return (
    <svg
      width={svgProps.width}
      height={svgProps.height}
      viewBox="0 0 35 35"
      fill={svgProps.fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="arrow-left">
        <path
          id="Vector"
          d="M21.5 25.5L13.5 18L21.5 10.5"
          stroke={svgProps.stroke}
          strokeWidth={svgProps.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
});

export const ArrowRight = React.memo(function ArrowRight({
  size,
}: {
  size: "sm" | "lg";
}) {
  const svgProps = SVGRStyles[size];
  return (
    <svg
      width={svgProps.width}
      height={svgProps.height}
      viewBox="0 0 35 35"
      fill={svgProps.fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="arrow-right">
        <path
          id="Vector"
          d="M13.5 25.5L21.5 18L13.5 10.5"
          stroke={svgProps.stroke}
          strokeWidth={svgProps.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
});
