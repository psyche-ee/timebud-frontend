import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { WeekdayPoint } from "../../lib/analytics";
import { hours } from "../../lib/format";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import ChartTooltip from "./ChartTooltip";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-2)",
  "var(--chart-4)",
];

interface WeekdayDonutChartProps {
  data: WeekdayPoint[];
  height?: number;
}

export default function WeekdayDonutChart({
  data,
  height = 210,
}: WeekdayDonutChartProps) {
  const reducedMotion = useReducedMotion();
  const total = data.reduce((sum, item) => sum + item.hours, 0);

  return (
    <div>
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="hours"
              nameKey="day"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={3}
              cornerRadius={5}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={!reducedMotion}
              animationDuration={500}
            >
              {data.map((entry, index) => (
                <Cell key={entry.day} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip format={(value) => hours(value)} />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular text-2xl font-bold text-foreground">
            {hours(total)}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Total hours
          </span>
        </div>
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {data.map((entry, index) => (
          <li key={entry.day} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: COLORS[index % COLORS.length] }}
              aria-hidden="true"
            />
            <span className="text-muted-foreground">{entry.day}</span>
            <span className="tabular ml-auto font-semibold text-foreground">
              {hours(entry.hours)}h
            </span>
          </li>
        ))}
      </ul>

      <table className="sr-only">
        <caption>Hours by weekday</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Hours</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={entry.day}>
              <td>{entry.day}</td>
              <td>{hours(entry.hours)} hours</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
