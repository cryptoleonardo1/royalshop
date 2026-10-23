// Slovak calendar days (Europe/Bratislava) for legal deadlines. Pure, safe on server and client.

const TZ = "Europe/Bratislava";

export interface CalendarDay {
  y: number;
  m: number; // 1–12
  d: number;
}

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function zonedParts(date: Date) {
  const p = Object.fromEntries(partsFormatter.formatToParts(date).map((x) => [x.type, x.value]));
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, min: +p.minute, s: +p.second };
}

// The Bratislava calendar day an instant falls on, whatever the server time zone is.
export function bratislavaDay(date: Date): CalendarDay {
  const { y, m, d } = zonedParts(date);
  return { y, m, d };
}

// UTC instant of 00:00 Bratislava time on that day (handles CET/CEST).
export function bratislavaMidnight(day: CalendarDay): Date {
  const guess = Date.UTC(day.y, day.m - 1, day.d);
  const p = zonedParts(new Date(guess));
  const offsetMs = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - guess;
  return new Date(guess - offsetMs);
}

export function addCalendarDays(day: CalendarDay, days: number): CalendarDay {
  const t = new Date(Date.UTC(day.y, day.m - 1, day.d + days));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

function easterSunday(y: number): CalendarDay {
  // Anonymous Gregorian algorithm
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { y, m: month, d: day };
}

// Public holidays and rest days. Deliberately conservative: 1. 9. and 17. 11. stay in the list although
// they stopped being days off (2024, 2025). A deadline that ends a day later only widens our own risk
// window; it can never cut a customer's right short.
const FIXED_HOLIDAYS = ["1-1", "1-6", "5-1", "5-8", "7-5", "8-29", "9-1", "9-15", "11-1", "11-17", "12-24", "12-25", "12-26"];

export function isSlovakHoliday(day: CalendarDay): boolean {
  if (FIXED_HOLIDAYS.includes(`${day.m}-${day.d}`)) return true;
  const easter = easterSunday(day.y);
  const goodFriday = addCalendarDays(easter, -2);
  const easterMonday = addCalendarDays(easter, 1);
  return [goodFriday, easterMonday].some((h) => h.m === day.m && h.d === day.d);
}

export function isWeekend(day: CalendarDay): boolean {
  const wd = new Date(Date.UTC(day.y, day.m - 1, day.d)).getUTCDay();
  return wd === 0 || wd === 6;
}

export function isWorkingDay(day: CalendarDay): boolean {
  return !isWeekend(day) && !isSlovakHoliday(day);
}

// § 122 ods. 3 OZ: a deadline whose last day is a Saturday, Sunday or holiday ends on the next working day.
export function shiftToWorkingDay(day: CalendarDay): CalendarDay {
  let d = day;
  while (!isWorkingDay(d)) d = addCalendarDays(d, 1);
  return d;
}

// Last instant (23:59:59.999 Bratislava) of a calendar day.
export function endOfBratislavaDay(day: CalendarDay): Date {
  return new Date(bratislavaMidnight(addCalendarDays(day, 1)).getTime() - 1);
}

// Whole Bratislava calendar days from `from` to `to` (negative when `to` is in the past).
export function calendarDaysBetween(from: Date, to: Date): number {
  const a = bratislavaDay(from);
  const b = bratislavaDay(to);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000);
}

// N working days after `from` (Slovak holidays included, unlike shipping's demo estimate).
export function addWorkingDays(from: Date, days: number): CalendarDay {
  let d = bratislavaDay(from);
  let added = 0;
  while (added < days) {
    d = addCalendarDays(d, 1);
    if (isWorkingDay(d)) added++;
  }
  return d;
}
