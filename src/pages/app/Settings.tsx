import { Link } from "react-router-dom";
import {
  ChevronRight,
  Download,
  FileText,
  Info,
  LockKeyhole,
  LogOut,
  Moon,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { logout, readUser } from "../../lib/auth";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import PageHeader from "../../components/ui/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import Avatar from "../../components/ui/Avatar";
import { ModeToggle } from "../../components/mode-toggle";

function SettingsRow({
  icon: Icon,
  label,
  description,
  to,
  action,
  external,
}: {
  icon: LucideIcon;
  label: string;
  description?: string;
  to?: string;
  action?: ReactNode;
  external?: boolean;
}) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
        )}
      </span>
      {action ?? <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
    </>
  );

  const classes =
    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-secondary/60 first:rounded-t-2xl last:rounded-b-2xl";

  if (action) {
    return <div className={classes}>{content}</div>;
  }
  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {content}
      </a>
    );
  }
  return (
    <Link to={to ?? "/settings"} className={classes}>
      {content}
    </Link>
  );
}

export default function Settings() {
  const { installPWA, showInstall } = usePWAInstall();
  const user = readUser();
  const fullName = [user.f_name, user.l_name].filter(Boolean).join(" ") || "Your profile";
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const canInstall = !isStandalone && (showInstall || isIOS);

  const handleInstall = () => {
    if (isIOS) {
      toast("Tap Share → Add to Home Screen to install TimeBud.");
    } else {
      installPWA();
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile, preferences, and app information."
        actions={
          canInstall ? (
            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-primary-hover active:scale-[0.98]"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Install app
            </button>
          ) : undefined
        }
      />

      <section className="surface-card animate-enter mb-4 flex items-center gap-4 p-5">
        <Avatar user={user} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-foreground">{fullName}</p>
          <p className="truncate text-sm text-muted-foreground">
            {user.email || "No email on file"}
          </p>
          <Link
            to="/profile"
            className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline"
          >
            Edit profile
          </Link>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <SectionCard title="Account" bodyClassName="divide-y divide-border p-0">
            <SettingsRow
              icon={UserRound}
              label="Profile"
              description="Personal details and hourly rate"
              to="/profile"
            />
            <SettingsRow
              icon={LockKeyhole}
              label="Change password"
              description="Keep your account secure"
              to="/change-password"
            />
          </SectionCard>

          <SectionCard title="Preferences" bodyClassName="divide-y divide-border p-0">
            <SettingsRow
              icon={Moon}
              label="Appearance"
              description="Switch between light and dark theme"
              action={<ModeToggle />}
            />
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="Information" bodyClassName="divide-y divide-border p-0">
            <SettingsRow
              icon={Info}
              label="About TimeBud"
              description="Version and app details"
              to="/about"
            />
            <SettingsRow
              icon={ShieldCheck}
              label="Privacy policy"
              description="How your data is handled"
              to="/privacy-policy"
            />
            <SettingsRow
              icon={FileText}
              label="Terms & conditions"
              description="Guidelines for using the app"
              to="/terms"
            />
          </SectionCard>

          <section className="surface-card overflow-hidden">
            <button
              type="button"
              onClick={logout}
              className="flex min-h-14 w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-destructive/5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-destructive">Sign out</span>
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
