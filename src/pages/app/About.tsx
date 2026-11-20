import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  FileText,
  Info,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import packageJson from "../../../package.json";
import PageHeader from "../../components/ui/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import Brand from "../../components/ui/Brand";

const features = [
  "Track daily time in and time out",
  "Automatically calculate earnings",
  "Visual insights into hours and income",
  "Filter, manage, and export work records",
  "Works offline with PWA support",
];

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="TimeBud"
        title="About"
        description="A simpler way to understand your time."
        backTo="/settings"
        backLabel="Back to settings"
      />

      <div className="mx-auto max-w-3xl space-y-4">
        <section className="surface-card animate-enter relative overflow-hidden p-7 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative flex justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Brand compact />
            </span>
          </div>
          <h2 className="relative mt-4 text-xl font-bold text-foreground">
            Time<span className="text-primary">Bud</span>
          </h2>
          <p className="relative mt-1.5 text-sm text-muted-foreground">
            Track your time. Manage your earnings. Stay productive.
          </p>
        </section>

        <SectionCard title="About the app" bodyClassName="p-5">
          <div className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Info className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              TimeBud is a simple and efficient time tracking application designed to
              help you monitor your working hours and calculate your earnings with ease.
              Whether you're a student, freelancer, or employee, TimeBud helps you stay
              organized and productive every day.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="What you can do" bodyClassName="p-5">
          <ul className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                  aria-hidden="true"
                />
                {feature}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Developer" bodyClassName="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Code2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Edward Belda</p>
              <p className="text-xs text-muted-foreground">Design & development</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Resources" bodyClassName="divide-y divide-border p-0">
          <Link
            to="/privacy-policy"
            className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-secondary/60"
          >
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium text-foreground">Privacy policy</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </Link>
          <Link
            to="/terms"
            className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-secondary/60"
          >
            <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium text-foreground">Terms & conditions</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </Link>
          <a
            href="https://github.com/psyche-ee/timebud-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-secondary/60"
          >
            <Rocket className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="flex-1 text-sm font-medium text-foreground">GitHub repository</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </a>
        </SectionCard>

        <p className="pt-2 text-center text-xs text-muted-foreground">
          Version {packageJson.version} · © {new Date().getFullYear()} TimeBud
        </p>
      </div>
    </>
  );
}
