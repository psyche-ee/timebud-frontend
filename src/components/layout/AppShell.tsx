import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  Home,
  Info,
  LogOut,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import BottomNav from "../BottomNav";
import { ModeToggle } from "../mode-toggle";
import Brand from "../ui/Brand";
import Avatar from "../ui/Avatar";
import { logout, readUser } from "../../lib/auth";

type NavItem = { to: string; label: string; icon: LucideIcon };

const workspace: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/records", label: "Records", icon: ClipboardList },
  { to: "/earnings", label: "Earnings", icon: Wallet },
];

const manage: NavItem[] = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/about", label: "About", icon: Info },
];

function SidebarLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={`h-[18px] w-[18px] transition-transform duration-200 ${
              isActive ? "scale-110" : "group-hover:scale-105"
            }`}
            aria-hidden="true"
          />
          <span>{item.label}</span>
          {isActive && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function AppShell() {
  const user = readUser();
  const fullName = [user.f_name, user.l_name].filter(Boolean).join(" ") || "Your account";

  return (
    <div className="min-h-dvh bg-background">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <Brand />
          <ModeToggle />
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card px-4 py-6 md:flex">
        <div className="px-2">
          <Brand />
        </div>

        <nav aria-label="Sidebar navigation" className="mt-10 flex-1">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Workspace
          </p>
          <div className="space-y-1">
            {workspace.map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
          </div>

          <p className="mb-2 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Manage
          </p>
          <div className="space-y-1">
            {manage.map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
          </div>
        </nav>

        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-3 px-1">
            <Avatar user={user} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">{fullName}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ModeToggle />
            <button
              type="button"
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="md:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:px-8 md:pb-12 md:pt-10">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
