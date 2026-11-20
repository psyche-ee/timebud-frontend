interface TooltipItem {
  name?: string | number;
  value?: string | number;
  color?: string;
  payload?: { fullLabel?: string };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string | number;
  format?: (value: number) => string;
  unit?: string;
}

export default function ChartTooltip({
  active,
  payload,
  label,
  format = (value) => value.toFixed(2),
  unit = "hrs",
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const heading =
    (payload[0]?.payload?.fullLabel as string | undefined) ?? String(label ?? "");

  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      {heading && (
        <p className="mb-1.5 font-semibold text-foreground">{heading}</p>
      )}
      {payload.map((item, index) => (
        <div key={`${item.name}-${index}`} className="flex items-center gap-2 text-muted-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: item.color ?? "var(--primary)" }}
            aria-hidden="true"
          />
          <span className="capitalize">{item.name}</span>
          <span className="tabular ml-auto font-semibold text-foreground">
            {format(Number(item.value) || 0)} {unit}
          </span>
        </div>
      ))}
    </div>
  );
}
