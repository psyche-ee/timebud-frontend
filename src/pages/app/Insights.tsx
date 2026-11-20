import { useEffect, useMemo, useState } from "react";
import { startOfDay, subDays } from "date-fns";
import {
  Award,
  BarChart3,
  CalendarCheck2,
  Clock3,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import SectionCard from "../../components/ui/SectionCard";
import SegmentedControl from "../../components/ui/SegmentedControl";
import EmptyState from "../../components/ui/EmptyState";
import HoursTrendChart from "../../components/charts/HoursTrendChart";
import EarningsBarChart from "../../components/charts/EarningsBarChart";
import WeekdayDonutChart from "../../components/charts/WeekdayDonutChart";
import api from "../../api/axios";
import { useRecords } from "../../hooks/useRecords";
import {
  dailySeries,
  insightSummary,
  recordHours,
  weekdaySeries,
} from "../../lib/analytics";
import { currency, formatDate, formatTime, hours } from "../../lib/format";

const ranges = [
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
];

export default function Insights() {
  const [range, setRange] = useState(7);
  const [forecast, setForecast] = useState({
    week: 0,
    month: 0,
    basis: "",
  });
  const { records, loading, error } = useRecords();

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await api.get("/earnings");
        const data = response.data?.data || {};
        setForecast({
          week: Number(data.forecast_week) || 0,
          month: Number(data.forecast_month) || 0,
          basis: String(data.forecast_basis || ""),
        });
      } catch (error) {
        console.error("Failed to fetch earnings forecast:", error);
      }
    };
    void fetchForecast();
  }, []);

  const scoped = useMemo(() => {
    const cutoff = subDays(startOfDay(new Date()), range - 1).getTime();
    return records.filter((record) => {
      const date = new Date(record.time_in).getTime();
      return Number.isFinite(date) && date >= cutoff;
    });
  }, [records, range]);

  const daily = useMemo(() => dailySeries(scoped, range), [scoped, range]);
  const weekdays = useMemo(() => weekdaySeries(scoped), [scoped]);
  const summary = useMemo(() => insightSummary(scoped), [scoped]);

  const sessionBuckets = useMemo(() => {
    const buckets = [
      { label: "Under 4h", min: 0, max: 4, count: 0, color: "var(--chart-2)" },
      { label: "4 – 8h", min: 4, max: 8, count: 0, color: "var(--chart-1)" },
      { label: "Over 8h", min: 8, max: Infinity, count: 0, color: "var(--chart-4)" },
    ];
    scoped.forEach((record) => {
      const value = recordHours(record);
      const bucket = buckets.find((item) => value >= item.min && value < item.max);
      if (bucket) bucket.count += 1;
    });
    return buckets;
  }, [scoped]);

  const maxBucket = Math.max(1, ...sessionBuckets.map((item) => item.count));

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Insights"
        description="See the story behind your hours and earnings."
        actions={
          <SegmentedControl
            options={ranges}
            value={range}
            onChange={setRange}
            label="Insights date range"
          />
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Total hours"
          value={hours(summary.totalHours)}
          hint={`Across ${range} days`}
          icon={Clock3}
          tone="primary"
          index={0}
          loading={loading}
        />
        <StatCard
          label="Total earnings"
          value={currency(summary.totalEarnings)}
          hint="In selected range"
          icon={Wallet}
          tone="emerald"
          index={1}
          loading={loading}
        />
        <StatCard
          label="Avg / active day"
          value={hours(summary.avgHours)}
          hint={`${summary.activeDays} active days`}
          icon={TrendingUp}
          tone="sky"
          index={2}
          loading={loading}
        />
        <StatCard
          label="Longest session"
          value={hours(summary.longest)}
          hint={summary.bestDay}
          icon={Award}
          tone="violet"
          index={3}
          loading={loading}
        />
      </div>

      <SectionCard
        title="Earnings forecast"
        description={forecast.basis || "Projected from your recent earning patterns"}
        className="mt-4"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
                On pace for
              </p>
              <p className="tabular text-2xl font-bold text-foreground">
                {currency(forecast.month)}
              </p>
              <p className="text-xs text-muted-foreground">by month end</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 sm:text-right">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Projected this week
            </p>
            <p className="tabular text-lg font-semibold text-foreground">
              {currency(forecast.week)}
            </p>
          </div>
        </div>
      </SectionCard>

      {!loading && scoped.length === 0 ? (
        <SectionCard className="mt-4">
          <EmptyState
            icon={BarChart3}
            title="No data for this period"
            description="Once you clock in and out, your charts and trends will appear here."
          />
        </SectionCard>
      ) : (
        <>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <SectionCard
              title="Hours trend"
              description={`Worked hours per day · last ${range} days`}
              className="xl:col-span-2"
            >
              <HoursTrendChart data={daily} height={250} />
            </SectionCard>
            <SectionCard
              title="Earnings trend"
              description="Daily earnings from your records"
            >
              <EarningsBarChart data={daily} height={250} />
            </SectionCard>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <SectionCard
              title="Work distribution"
              description="Hours by day of the week"
            >
              <WeekdayDonutChart data={weekdays} />
            </SectionCard>

            <SectionCard
              title="Session rhythm"
              description="How your shifts are distributed"
            >
              <ul className="space-y-5 pt-1">
                {sessionBuckets.map((bucket) => (
                  <li key={bucket.label}>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{bucket.label}</span>
                      <span className="tabular text-muted-foreground">
                        {bucket.count} {bucket.count === 1 ? "session" : "sessions"}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(bucket.count / maxBucket) * 100}%`,
                          background: bucket.color,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Highlights" description="A quick look at your range">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Award className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">Best day</p>
                    <p className="text-sm font-semibold text-foreground">
                      {summary.bestDay}
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">Active days</p>
                    <p className="text-sm font-semibold text-foreground">
                      {summary.activeDays} of {range} days
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">Daily average</p>
                    <p className="text-sm font-semibold text-foreground">
                      {hours(summary.avgHours)}
                    </p>
                  </div>
                </li>
              </ul>
            </SectionCard>
          </div>

          <SectionCard
            title="Daily breakdown"
            description="Your most recent sessions in this range"
            className="mt-4"
            bodyClassName="overflow-x-auto p-0"
          >
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-border bg-secondary/40 text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Date</th>
                  <th scope="col" className="px-4 py-3 font-medium">Time in</th>
                  <th scope="col" className="px-4 py-3 font-medium">Time out</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Hours</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scoped
                  .slice()
                  .sort((a, b) => new Date(b.time_in).getTime() - new Date(a.time_in).getTime())
                  .slice(0, 8)
                  .map((record) => (
                    <tr key={record.id} className="transition-colors hover:bg-secondary/40">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {formatDate(record.time_in, "MMM d, yyyy")}
                      </td>
                      <td className="tabular px-4 py-3 text-muted-foreground">
                        {formatTime(record.time_in)}
                      </td>
                      <td className="tabular px-4 py-3 text-muted-foreground">
                        {record.time_out ? formatTime(record.time_out) : "Active"}
                      </td>
                      <td className="tabular px-4 py-3 text-right font-medium text-foreground">
                        {hours(record.total_hrs || 0)}
                      </td>
                      <td className="tabular px-4 py-3 text-right font-semibold text-primary">
                        {currency(record.earnings)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </SectionCard>
        </>
      )}
    </>
  );
}
