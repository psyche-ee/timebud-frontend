import { Link } from "react-router-dom";
import {
  Check,
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
import { useState, type ReactNode } from "react";
import { logout, readUser } from "../../lib/auth";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
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
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  description?: string;
  to?: string;
  action?: ReactNode;
  external?: boolean;
  onClick?: () => void;
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

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }
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
  const [installOpen, setInstallOpen] = useState(false);
  const user = readUser();
  const fullName = [user.f_name, user.l_name].filter(Boolean).join(" ") || "Your profile";
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleInstall = () => {
    if (isIOS) {
      toast("Tap Share → Add to Home Screen to install TimeBud.");
      return;
    }
    setInstallOpen(true);
  };

  const handleDownload = async () => {
    setInstallOpen(false);
    if (showInstall) {
      await installPWA();
    } else {
      toast("Use your browser menu → Install app / Add to Home Screen.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your profile, preferences, and app information."
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

          <SectionCard title="App" bodyClassName="divide-y divide-border p-0">
            <SettingsRow
              icon={Download}
              label={isStandalone ? "App installed" : "Download app"}
              description={
                isStandalone
                  ? "TimeBud is running as an installed app"
                  : "Install TimeBud on your device for quick access"
              }
              onClick={isStandalone ? undefined : handleInstall}
              action={
                isStandalone ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Installed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white">
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Download
                  </span>
                )
              }
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

      <Dialog open={installOpen} onOpenChange={setInstallOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Download TimeBud</DialogTitle>
            <DialogDescription>
              Install the app on your Android device for quick access and offline
              use.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Download className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {showInstall
                ? "Your browser is ready to install TimeBud. Tap below to download and add it to your home screen."
                : "Open your browser menu and choose Install app or Add to Home Screen to download TimeBud."}
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button
                type="button"
                className="min-h-11 rounded-xl border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="button"
              onClick={() => void handleDownload()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {showInstall ? "Download & install" : "Got it"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
