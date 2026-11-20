import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyPoint } from "../../lib/analytics";
import { compactCurrency, currency } from "../../lib/format";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import ChartTooltip from "./ChartTooltip";

interface EarningsBarChartProps {
  data: DailyPoint[];
  height?: number;
}

export default function EarningsBarChart({
  data,
  height = 230,
}: EarningsBarChartProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div>
      <div
        role="img"
        aria-label="Daily earnings bar chart"
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 6, left: -12, bottom: 0 }}>
            <CartesianGrid
              vertical={false}
              stroke="var(--chart-grid)"
              strokeDasharray="4 5"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickFormatter={compactCurrency}
              width={52}
            />
            <Tooltip
              cursor={{ fill: "color-mix(in oklab, var(--primary) 8%, transparent)" }}
              content={<ChartTooltip format={(value) => currency(value)} unit="" />}
            />
            <Bar
              dataKey="earnings"
              name="Earned"
              fill="var(--chart-1)"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
              isAnimationActive={!reducedMotion}
              animationDuration={500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>Daily earnings</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Earnings</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.key}>
              <td>{point.fullLabel}</td>
              <td>{currency(point.earnings)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
