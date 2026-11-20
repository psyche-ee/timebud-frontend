import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CircleDollarSign, Sparkles, TrendingUp, Wallet } from "lucide-react";
import api from "../../api/axios";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import SectionCard from "../../components/ui/SectionCard";
import EarningsBarChart from "../../components/charts/EarningsBarChart";
import { useRecords } from "../../hooks/useRecords";
import { monthlySeries, type DailyPoint } from "../../lib/analytics";
import { currency } from "../../lib/format";

const CACHE_KEY = "earningsCache";
const EMPTY = {
  total: 0,
  regular: 0,
  overtime: 0,
  regular_hrs: 0,
  overtime_hrs: 0,
  this_week: 0,
  this_month: 0,
  forecast_week: 0,
  forecast_month: 0,
  forecast_basis: "",
};

export default function Earnings() {
  const [earnings, setEarnings] = useState<typeof EMPTY>(EMPTY);
  const [loading, setLoading] = useState(true);
  const { records } = useRecords();

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await api.get("/earnings");
        const data = response.data?.data || response.data || {};
        if (!data || typeof data !== "object") throw new Error("Invalid earnings data");

        const next = {
          total: Number(data.total) || 0,
          regular: Number(data.regular) || 0,
          overtime: Number(data.overtime) || 0,
          regular_hrs: Number(data.regular_hrs) || 0,
          overtime_hrs: Number(data.overtime_hrs) || 0,
          this_week: Number(data.this_week) || 0,
          this_month: Number(data.this_month) || 0,
          forecast_week: Number(data.forecast_week) || 0,
          forecast_month: Number(data.forecast_month) || 0,
          forecast_basis: String(data.forecast_basis || ""),
        };
        setEarnings(next);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: next, timestamp: Date.now() })
        );
      } catch (error) {
        console.error("Failed to fetch earnings:", error);
        setEarnings(EMPTY);
      } finally {
        setLoading(false);
      }
    };

    void fetchEarnings();
  }, []);

  const monthly = useMemo<DailyPoint[]>(
    () =>
      monthlySeries(records, 6).map((point) => ({
        key: point.key,
        label: point.label,
        fullLabel: `${point.label} ${point.key.slice(0, 4)}`,
        hours: point.hours,
        earnings: point.earnings,
      })),
    [records]
  );

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Earnings"
        description="A clear view of what your time is worth."
      />

      {/* Hero */}
      <section className="surface-card animate-enter relative overflow-hidden p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Total earnings
            </p>
            {loading ? (
              <div className="skeleton mt-3 h-12 w-48" />
            ) : (
              <p className="tabular mt-2 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                {currency(earnings.total)}
              </p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              Accumulated from all your recorded work sessions.
            </p>
          </div>
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CircleDollarSign className="h-8 w-8" aria-hidden="true" />
          </span>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <StatCard
          label="This week"
          value={currency(earnings.this_week)}
          hint="This calendar week"
          icon={CalendarDays}
          tone="primary"
          index={0}
          loading={loading}
        />
        <StatCard
          label="This month"
          value={currency(earnings.this_month)}
          hint="Current calendar month"
          icon={TrendingUp}
          tone="sky"
          index={1}
          loading={loading}
        />
        <StatCard
          label="All time"
          value={currency(earnings.total)}
          hint="Since you joined"
          icon={Wallet}
          tone="violet"
          index={2}
          loading={loading}
        />
        <StatCard
          label="Overtime"
          value={currency(earnings.overtime)}
          hint={`${earnings.overtime_hrs.toFixed(2)} hrs beyond daily threshold`}
          icon={TrendingUp}
          tone="amber"
          index={3}
          loading={loading}
        />
      </div>

      {(earnings.forecast_month > 0 || earnings.forecast_week > 0) && (
        <section className="surface-card animate-enter mt-4 flex flex-col gap-4 overflow-hidden border-primary/15 bg-primary/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
                Earnings forecast
              </p>
              {loading ? (
                <div className="skeleton mt-2 h-7 w-56" />
              ) : (
                <p className="mt-1 text-lg font-bold text-foreground sm:text-xl">
                  On pace for {currency(earnings.forecast_month)} by month end
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {earnings.forecast_basis || "Based on your recent earning patterns."}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-6 sm:gap-8 sm:text-right">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                This week
              </p>
              <p className="tabular text-sm font-semibold text-foreground">
                {currency(earnings.forecast_week)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Month end
              </p>
              <p className="tabular text-sm font-semibold text-primary">
                {currency(earnings.forecast_month)}
              </p>
            </div>
          </div>
        </section>
      )}

      <SectionCard
        title="Earnings by month"
        description="Your income trend over the last 6 months"
        className="mt-4"
      >
        <EarningsBarChart data={monthly} height={260} />
      </SectionCard>

      <SectionCard
        title="Earnings by type"
        description="Regular pay vs overtime pay"
        className="mt-4"
        bodyClassName="space-y-5 p-4 sm:p-5"
      >
        {[
          {
            label: "Regular",
            value: earnings.regular,
            hours: earnings.regular_hrs,
            icon: Wallet,
            color: "var(--chart-1)",
          },
          {
            label: "Overtime",
            value: earnings.overtime,
            hours: earnings.overtime_hrs,
            icon: TrendingUp,
            color: "var(--chart-2)",
          },
        ].map(({ label, value, hours, icon: Icon, color }) => {
          const ratio =
            earnings.total > 0 ? Math.min(1, value / earnings.total) : 0;
          return (
            <div key={label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  {label}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({hours.toFixed(2)} hrs)
                  </span>
                </span>
                {loading ? (
                  <div className="skeleton h-5 w-20" />
                ) : (
                  <span className="tabular text-sm font-semibold text-foreground">
                    {currency(value)}
                  </span>
                )}
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${ratio * 100}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </SectionCard>
    </>
  );
}
