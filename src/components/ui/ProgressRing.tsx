interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({
  value,
  max = 8,
  size = 148,
  label,
  sublabel,
}: ProgressRingProps) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(1, Math.max(0, max > 0 ? value / max : 0));
  const offset = circumference * (1 - ratio);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label ?? "Progress"}: ${value.toFixed(1)} of ${max} hours`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="tabular text-2xl font-bold text-foreground">
          {value.toFixed(1)}h
        </span>
        {label && (
          <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
        )}
        {sublabel && (
          <span className="mt-0.5 text-[10px] text-muted-foreground">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
