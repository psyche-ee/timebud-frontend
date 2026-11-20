import type { ReactNode } from "react";
import { Check, Clock3, Sparkles, TrendingUp } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import Brand from "../ui/Brand";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-[#071736] via-[#123a79] to-[#2563eb] p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky-400/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <Clock3 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight">
            Time<span className="text-sky-200">Bud</span>
          </span>
        </div>

        <div className="relative my-auto max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-sky-100 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Time tracking, made clear
          </span>
          <h2 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight xl:text-5xl">
            Make every hour
            <br />
            count.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-blue-100/90 xl:text-base">
            Track your workday, understand where your time goes, and see your
            earnings take shape — all in one calm, focused workspace.
          </p>

          <ul className="mt-9 space-y-3.5 text-sm">
            {[
              "Clock in and out in a single tap",
              "Visual insights for hours and earnings",
              "Works offline, syncs when you're back",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-blue-50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <TrendingUp className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-blue-100">Tracked this week</p>
              <p className="text-lg font-semibold">32.5 hours</p>
            </div>
            <div className="ml-auto flex h-9 items-end gap-1" aria-hidden="true">
              {[40, 68, 52, 88, 64, 30, 78].map((height, index) => (
                <span
                  key={index}
                  className="w-1.5 rounded-full bg-sky-200/80"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="relative text-xs text-blue-200/70">
          © {new Date().getFullYear()} TimeBud · Built for focus
        </p>
      </aside>

      <main className="relative flex min-h-dvh flex-col px-5 py-6 sm:px-10 lg:min-h-0 lg:py-8">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <Brand />
          </div>
          <ModeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <p className="text-center text-xs text-muted-foreground lg:hidden">
          Track time. Understand earnings. Stay productive.
        </p>
      </main>
    </div>
  );
}

interface AuthCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="surface-card animate-enter p-6 shadow-[0_20px_60px_-30px_rgba(37,99,235,0.35)] sm:p-8">
      {eyebrow && (
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-7">{children}</div>
      {footer && (
        <div className="mt-7 border-t border-border pt-5 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}
