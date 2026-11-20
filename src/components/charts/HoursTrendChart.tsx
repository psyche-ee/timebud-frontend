import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyPoint } from "../../lib/analytics";
import { hours } from "../../lib/format";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import ChartTooltip from "./ChartTooltip";

interface HoursTrendChartProps {
  data: DailyPoint[];
  height?: number;
}

export default function HoursTrendChart({
  data,
  height = 230,
}: HoursTrendChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const reducedMotion = useReducedMotion();

  return (
    <div>
      <div
        role="img"
        aria-label="Daily worked hours trend chart"
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
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
              tickFormatter={(value: number) => hours(value)}
              width={46}
              allowDecimals
            />
            <Tooltip
              cursor={{ stroke: "var(--primary)", strokeDasharray: "4 4" }}
              content={<ChartTooltip format={(value) => hours(value)} unit="" />}
            />
            <Area
              type="monotone"
              dataKey="hours"
              name="Hours"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 5,
                fill: "var(--chart-1)",
                stroke: "var(--card)",
                strokeWidth: 2,
              }}
              isAnimationActive={!reducedMotion}
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>Daily worked hours</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Hours</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.key}>
              <td>{point.fullLabel}</td>
              <td>{hours(point.hours)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
