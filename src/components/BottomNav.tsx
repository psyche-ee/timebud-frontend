import { NavLink } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  Home,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const items: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/records", label: "Records", icon: ClipboardList },
  { to: "/earnings", label: "Earnings", icon: Wallet },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-1.5 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `group flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-1 text-[10px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isActive ? "scale-110" : "group-hover:scale-105"
                  }`}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
