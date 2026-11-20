import { format, parseISO, startOfDay, subDays } from "date-fns";

export interface WorkRecord {
  id: number;
  time_in: string;
  time_out: string | null;
  total_hrs?: number | string | null;
  earnings?: number | string | null;
  regular_hrs?: number | string | null;
  overtime_hrs?: number | string | null;
  regular_earnings?: number | string | null;
  overtime_earnings?: number | string | null;
  rate_per_hr?: number | string | null;
  overtime_rate_per_hr?: number | string | null;
  user_id?: number;
}

export interface DailyPoint {
  key: string;
  label: string;
  fullLabel: string;
  hours: number;
  earnings: number;
}

export interface WeekdayPoint {
  day: string;
  hours: number;
  earnings: number;
}

export interface MonthlyPoint {
  key: string;
  label: string;
  hours: number;
  earnings: number;
}

const BUSINESS_TIME_ZONE = "Asia/Manila";

const parseInstant = (value: string | Date) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Calendar date in the app's business timezone (Asia/Manila), rendered as a
 * local Date at midnight so date-fns can format it without a UTC shift.
 */
const businessDate = (value: string | Date) => {
  const instant = parseInstant(value);
  if (!instant) return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  const year = Number(part("year"));
  const month = Number(part("month"));
  const day = Number(part("day"));
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
};

const recordDate = (record: WorkRecord) => businessDate(record.time_in);

export const recordHours = (record: WorkRecord) => {
  const stored = Number(record.total_hrs);
  if (Number.isFinite(stored) && stored > 0) return stored;
  if (!record.time_out) return 0;
  const start = parseInstant(record.time_in);
  const end = parseInstant(record.time_out);
  if (!start || !end) return 0;
  return Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
};

export const recordEarnings = (record: WorkRecord) =>
  Math.max(0, Number(record.earnings) || 0);

/** Hours and earnings per day for the last `days` days, including today. */
export const dailySeries = (records: WorkRecord[], days = 7): DailyPoint[] => {
  const buckets = new Map<string, DailyPoint>();
  const today = businessDate(new Date()) ?? startOfDay(new Date());

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = subDays(today, offset);
    const key = format(date, "yyyy-MM-dd");
    buckets.set(key, {
      key,
      label: days <= 7 ? format(date, "EEE") : format(date, "MMM d"),
      fullLabel: format(date, "EEE, MMM d"),
      hours: 0,
      earnings: 0,
    });
  }

  records.forEach((record) => {
    const date = recordDate(record);
    if (!date) return;
    const key = format(startOfDay(date), "yyyy-MM-dd");
    const bucket = buckets.get(key);
    if (!bucket) return;
    bucket.hours += recordHours(record);
    bucket.earnings += recordEarnings(record);
  });

  return Array.from(buckets.values()).map((bucket) => ({
    ...bucket,
    hours: Number(bucket.hours.toFixed(2)),
    earnings: Number(bucket.earnings.toFixed(2)),
  }));
};

/** Hours and earnings grouped by weekday, ordered Monday → Sunday. */
export const weekdaySeries = (records: WorkRecord[]): WeekdayPoint[] => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const totals = days.map((day) => ({ day, hours: 0, earnings: 0 }));

  records.forEach((record) => {
    const date = recordDate(record);
    if (!date) return;
    const index = (date.getDay() + 6) % 7;
    totals[index].hours += recordHours(record);
    totals[index].earnings += recordEarnings(record);
  });

  return totals.map((item) => ({
    ...item,
    hours: Number(item.hours.toFixed(2)),
    earnings: Number(item.earnings.toFixed(2)),
  }));
};

/** Aggregated totals used by the Insights stat cards. */
export const insightSummary = (records: WorkRecord[]) => {
  const valid = records.filter((record) => recordDate(record));
  const totalHours = valid.reduce((sum, record) => sum + recordHours(record), 0);
  const totalEarnings = valid.reduce((sum, record) => sum + recordEarnings(record), 0);
  const activeDays = new Set(
    valid
      .map((record) => businessDate(record.time_in))
      .filter((date): date is Date => date !== null)
      .map((date) => format(date, "yyyy-MM-dd"))
  ).size;
  const longest = valid.reduce(
    (best, record) => Math.max(best, recordHours(record)),
    0
  );
  const bestRecord = valid.reduce<WorkRecord | null>(
    (best, record) =>
      !best || recordHours(record) > recordHours(best) ? record : best,
    null
  );

  return {
    totalHours,
    totalEarnings,
    activeDays,
    avgHours: activeDays ? totalHours / activeDays : 0,
    longest,
    bestDay: bestRecord
      ? format(businessDate(bestRecord.time_in) ?? new Date(bestRecord.time_in), "EEE, MMM d")
      : "—",
  };
};

/** Monthly rollup for the earnings page (last `months` months, oldest first). */
export const monthlySeries = (records: WorkRecord[], months = 6): MonthlyPoint[] => {
  const buckets = new Map<string, MonthlyPoint>();
  const now = businessDate(new Date()) ?? new Date();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = format(date, "yyyy-MM");
    buckets.set(key, {
      key,
      label: format(date, "MMM"),
      hours: 0,
      earnings: 0,
    });
  }

  records.forEach((record) => {
    const date = recordDate(record);
    if (!date) return;
    const bucket = buckets.get(format(date, "yyyy-MM"));
    if (!bucket) return;
    bucket.hours += recordHours(record);
    bucket.earnings += recordEarnings(record);
  });

  return Array.from(buckets.values()).map((bucket) => ({
    ...bucket,
    hours: Number(bucket.hours.toFixed(2)),
    earnings: Number(bucket.earnings.toFixed(2)),
  }));
};

/** Parse a `yyyy-MM-dd` string without the UTC shift caused by `new Date()`. */
export const fromDateInput = (value: string) => parseISO(value);
