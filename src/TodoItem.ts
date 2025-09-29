import { getDateDaysDiff, getDateInfoFromString } from "./DateUtils";

export enum TodoPriority {
  Critical,
  High,
  Normal,
  Low,
  Waiting,
}

export class TodoItem {
  public static readonly RegEx =
    /(🔷|⏳|❓|❗|‼️|⚠️|📈|TODO:|\[[\s-]\])(<([^>]+)>)?\s*([^.\r\n]+)/g;

  public readonly text: string;
  private readonly info: string;
  public readonly todoPrefix: string;
  private readonly fullMatch: string;

  constructor(regexMatch: RegExpExecArray) {
    this.fullMatch = regexMatch[0];
    this.todoPrefix = regexMatch[1];
    this.info = regexMatch[3];
    this.text = regexMatch[4];
  }
  public get daysDiff(): number {
    let date = getDateInfoFromString(this.info);
    return getDateDaysDiff(date);
  }
  public get priority(): TodoPriority {
    let priority = TodoPriority.Normal;
    if (this.todoPrefix === "‼️") {
      priority = TodoPriority.Critical;
    } else if (
      this.todoPrefix === "❗" ||
      this.todoPrefix === "🚩" ||
      this.todoPrefix === "⚠️" ||
      this.todoPrefix === "❓"
    ) {
      priority = TodoPriority.High;
    } else if (this.todoPrefix === "📈") {
      priority = TodoPriority.Normal;
    } else {
      priority = TodoPriority.Low;
    }
    return priority;
  }

  public get details(): string {
    let details = `anytime`;
    if (this.hasDeadline) {
      let date = getDateInfoFromString(this.info);
      let schedule;
      if (this.daysDiff === 0) {
        schedule = "today";
      }
      if (this.daysDiff > 0) {
        schedule = `in ${this.daysDiff} day(s)`;
      }
      if (this.daysDiff < 0) {
        schedule = `${-this.daysDiff} day(s) ago`;
      }
      details = `${date.getDate()}/${date.getMonth() + 1} - ${schedule}`;
    }
    return details;
  }

  public get hasDeadline(): boolean {
    if (
      this.info &&
      (this.info.startsWith("CW") || this.info.match(/\d+\/\d+/))
    ) {
      return true;
    } else {
      return false;
    }
  }

  public get textIndexInMatch(): number {
    return this.fullMatch.indexOf(this.text);
  }
}
