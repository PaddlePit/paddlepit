import type { ISODate, ISODateTime, VenueConfig } from "@/types/booking";

export const MS_PER_MINUTE = 60_000;

// ---------------------------------------------------------------------------
// Pure calendar helpers (business dates are plain "YYYY-MM-DD" strings; the
// timezone only matters when converting a business date into an instant).
// ---------------------------------------------------------------------------

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseBusinessDate(value: ISODate): { year: number; month: number; day: number } {
  const match = ISO_DATE_RE.exec(value);
  if (!match) throw new Error(`Invalid business date: ${value}`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function isoDateFromParts(year: number, month: number, day: number): ISODate {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function fromUTCDate(d: Date): ISODate {
  return isoDateFromParts(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/** Add N business days to a business date (pure calendar arithmetic). */
export function addBusinessDays(isoDate: ISODate, days: number): ISODate {
  const { year, month, day } = parseBusinessDate(isoDate);
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  d.setUTCDate(d.getUTCDate() + days);
  return fromUTCDate(d);
}

// ---------------------------------------------------------------------------
// Timezone helpers — all formatting/instant math happens in the venue tz.
// ---------------------------------------------------------------------------

/** Signed UTC offset (ms) for the venue timezone at the given instant. */
export function tzOffsetMs(timeZone: string, at: Date): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = fmt.formatToParts(at);
  const p = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((x) => x.type === type)?.value);
  const asUTC = Date.UTC(p("year"), p("month") - 1, p("day"), p("hour"), p("minute"), p("second"));
  const offset = asUTC - at.getTime();
  if (Number.isNaN(offset)) throw new Error(`Could not resolve timezone offset: ${timeZone}`);
  return offset;
}

/** Offset suffix like "+08:00" for the venue timezone at the given instant. */
export function tzOffsetSuffix(timeZone: string, at: Date): string {
  const ms = tzOffsetMs(timeZone, at);
  const sign = ms < 0 ? "-" : "+";
  const abs = Math.abs(ms);
  const hh = Math.floor(abs / 3_600_000);
  const mm = Math.floor((abs % 3_600_000) / 60_000);
  return `${sign}${pad2(hh)}:${pad2(mm)}`;
}

/** Absolute instant corresponding to 00:00 of a business date in the venue tz. */
export function bizDateStart(isoDate: ISODate, timeZone: string): Date {
  const { year, month, day } = parseBusinessDate(isoDate);
  const noonProbe = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const offset = tzOffsetMs(timeZone, noonProbe);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - offset);
}

/** The wall-clock "YYYY-MM-DD" (business date) in the venue timezone for an instant. */
export function isoToBusinessDate(startISO: ISODateTime, timeZone: string): ISODate {
  const d = new Date(startISO);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const p = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((x) => x.type === type)?.value ?? "";
  return `${p("year")}-${p("month")}-${p("day")}`;
}

/**
 * ISO 8601 timestamp for the instant that is `minutesFromMidnight` minutes
 * into the given business date, in the venue timezone. Overnight hours work
 * because minutes can exceed 1440 (they roll over to the following calendar
 * day while still belonging to this business date). The string is built from
 * the VENUE wall clock (the `+08:00` suffix alone would be ambiguous), so
 * 00:00 of 2026-09-21 in Manila is "2026-09-21T00:00:00+08:00".
 */
export function minutesIntoDayToISO(
  isoDate: ISODate,
  minutesFromMidnight: number,
  timeZone: string
): ISODateTime {
  const instant = new Date(
    bizDateStart(isoDate, timeZone).getTime() + minutesFromMidnight * MS_PER_MINUTE
  );
  const offset = tzOffsetSuffix(timeZone, instant);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = fmt.formatToParts(instant);
  const p = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((x) => x.type === type)?.value ?? "";
  return `${p("year")}-${p("month")}-${p("day")}T${p("hour")}:${p("minute")}:00${offset}`;
}

/**
 * Generate every slot start time for one business date, from openHour to just
 * before closeHour. e.g. open 0, close 24, slot 60 → starts at 00:00 .. 23:00
 * (the 24 hourly slots of the business date).
 */
export function generateSlotStarts(
  isoDate: ISODate,
  venue: Pick<VenueConfig, "openHour" | "closeHour" | "slotMinutes" | "timezone">
): ISODateTime[] {
  const starts: ISODateTime[] = [];
  const endMinutes = venue.closeHour * 60;
  for (let minutes = venue.openHour * 60; minutes < endMinutes; minutes += venue.slotMinutes) {
    starts.push(minutesIntoDayToISO(isoDate, minutes, venue.timezone));
  }
  return starts;
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

function hourLabel(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h12",
  }).formatToParts(instant);
  const hourRaw = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "";
  const dayPeriod = parts.find((p) => p.type === "dayPeriod")?.value ?? "";
  const hour = Number(hourRaw);
  return minute === "00" ? `${hour} ${dayPeriod}` : `${hour}:${minute} ${dayPeriod}`;
}

/** "6 AM – 7 AM" */
export function formatTimeRange(startISO: ISODateTime, minutes: number, timeZone: string): string {
  const start = new Date(startISO);
  const end = new Date(start.getTime() + minutes * MS_PER_MINUTE);
  return `${hourLabel(start, timeZone)} – ${hourLabel(end, timeZone)}`;
}

/** "6 AM" */
export function formatTimeStart(startISO: ISODateTime, timeZone: string): string {
  return hourLabel(new Date(startISO), timeZone);
}

export function weekdayIndexInTz(isoDate: ISODate, timeZone: string): number {
  // 0 = Sunday ... 6 = Saturday. The UTC weekday of the local-midnight instant
  // equals the venue-tz weekday for fixed-offset timezones such as Asia/Manila.
  return bizDateStart(isoDate, timeZone).getUTCDay();
}

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "MON/4" for a day pill */
export function formatDayPill(isoDate: ISODate, timeZone: string): { label: string; day: number } {
  const { day } = parseBusinessDate(isoDate);
  return { label: WEEKDAY_SHORT[weekdayIndexInTz(isoDate, timeZone)].toUpperCase(), day };
}

/** "Aug 4" / "Aug 4 – 10" / "Aug 31 – Sep 6" */
export function formatWeekRangeLabel(days: ISODate[]): string {
  if (days.length === 0) return "";
  const first = parseBusinessDate(days[0]);
  const last = parseBusinessDate(days[days.length - 1]);
  const firstStr = `${MONTH_SHORT[first.month - 1]} ${first.day}`;
  if (first.month === last.month) return `${firstStr} – ${last.day}`;
  return `${firstStr} – ${MONTH_SHORT[last.month - 1]} ${last.day}`;
}

/** "Wed, Aug 6" */
export function formatLongDate(isoDate: ISODate, timeZone: string): string {
  const wd = WEEKDAY_SHORT[weekdayIndexInTz(isoDate, timeZone)];
  const { month, day } = parseBusinessDate(isoDate);
  return `${wd}, ${MONTH_SHORT[month - 1]} ${day}`;
}

/**
 * Start-of-week business date containing `isoDate`, using SQL day numbering
 * (0 = Sunday ... 6 = Saturday; weekStartsOn 1 = Monday).
 */
export function startOfWeek(isoDate: ISODate, timeZone: string, weekStartsOn: number): ISODate {
  const wd = weekdayIndexInTz(isoDate, timeZone);
  const shift = (wd - weekStartsOn + 7) % 7;
  return addBusinessDays(isoDate, -shift);
}

/** The 7 business dates of a week (starting at weekStart). */
export function daysOfWeek(weekStart: ISODate): ISODate[] {
  return Array.from({ length: 7 }, (_, i) => addBusinessDays(weekStart, i));
}

export function isPastSlot(startISO: ISODateTime, serverTimeISO: ISODateTime): boolean {
  return new Date(startISO).getTime() < new Date(serverTimeISO).getTime();
}

export function slotEnd(startISO: ISODateTime, minutes: number): ISODateTime {
  return new Date(new Date(startISO).getTime() + minutes * MS_PER_MINUTE).toISOString();
}

export function totalMinutesText(totalMinutes: number): string {
  const hours = totalMinutes / 60;
  const text = Number.isInteger(hours) ? `${hours}` : String(Math.round(hours * 10) / 10);
  return `${text} hour${hours === 1 ? "" : "s"}`;
}