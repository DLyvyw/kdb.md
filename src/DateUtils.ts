import { createSecureServer } from "http2";

export function getDateWeek(date: Date): number {
  const currentDate = date;
  const januaryFirst = new Date(currentDate.getFullYear(), 0, 1);
  const daysToNextMonday =
    januaryFirst.getDay() === 1 ? 0 : (7 - januaryFirst.getDay()) % 7;
  const nextMonday = new Date(
    currentDate.getFullYear(),
    0,
    januaryFirst.getDate() + daysToNextMonday
  );

  const weekNumber =
    currentDate.getTime() < nextMonday.getTime()
      ? 52
      : currentDate.getTime() > nextMonday.getTime()
      ? Math.ceil(
          (currentDate.getTime() - nextMonday.getTime()) /
            (24 * 3600 * 1000) /
            7
        )
      : 1;
  return weekNumber + 1;
}

export function getCWFromDate(date: Date): string {
  return `CW${getDateWeek(date)}.${date.getDay()}`;
}

export function getDateDaysDiff(date: Date): number {
  let now = new Date();
  let diff = Math.ceil((date.getTime() - now.getTime()) / (24 * 3600 * 1000));
  return diff;
}

export function getDateInfoFromString(todoDate: string): Date {
  let result = new Date(0);
  if (todoDate && todoDate.startsWith("CW")) {
    const cwDate = todoDate.replace("CW", "");
    const cwSplit = cwDate.split(".");
    if (cwSplit) {
      const cw = cwSplit.at(0);
      const day = cwSplit.at(1);
      if (cw) {
        try {
          let cwInt = Number.parseInt(cw);
          let dayInt = 5; // last work day
          if (day) {
            dayInt = Number.parseInt(day);
          }
          const currentDate = new Date();
          const januaryFirst = new Date(currentDate.getFullYear(), 0, 1);
          const daysToNextMonday =
            januaryFirst.getDay() === 1 ? 0 : (7 - januaryFirst.getDay()) % 7;
          const date = new Date(
            januaryFirst.getTime() +
              ((cwInt - 1) * 7 - (7 - daysToNextMonday) + dayInt) *
                (24 * 3600 * 1000)
          );
          result = date;
        } catch (e) {}
      }
    }
  } else {
    if (todoDate && todoDate.match(/\d+\/\d+/)) {
      const cwSplit = todoDate.split("/");
      const day = cwSplit.at(0);
      const month = cwSplit.at(1);
      if (cwSplit && day && month) {
        try {
          const monthInt = Number.parseInt(month) - 1;
          const dayInt = Number.parseInt(day);
          let date = new Date();
          date.setDate(dayInt);
          date.setMonth(monthInt);
          result = date;
        } catch (e) {}
      }
    }
  }
  return result;
}
