import type { LucideIcon } from "lucide-react";

type Tone = "primary" | "sky" | "amber" | "violet" | "emerald";

const tones: Record<Tone, { icon: string; glow: string }> = {
  primary: {
    icon: "bg-primary/10 text-primary",
    glow: "bg-primary/60",
  },
  sky: {
    icon: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    glow: "bg-sky-500/60",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    glow: "bg-amber-500/60",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    glow: "bg-violet-500/60",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    glow: "bg-emerald-500/60",
  },
};

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
  loading?: boolean;
  index?: number;
}

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  loading = false,
  index = 0,
}: StatCardProps) {
  const palette = tones[tone];

  return (
    <div
      className="interactive-card relative overflow-hidden p-4 sm:p-5 animate-enter"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -right-6 -top-7 h-20 w-20 rounded-full opacity-[0.07] blur-xl ${palette.glow}`}
      />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${palette.icon}`}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
      </div>

      {loading ? (
        <div className="skeleton mt-4 h-8 w-28" />
      ) : (
        <p className="tabular mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[1.7rem]">
          {value}
        </p>
      )}

      {hint && !loading && (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
