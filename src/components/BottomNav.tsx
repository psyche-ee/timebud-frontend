import { IoHome, IoTime, IoSettings } from "react-icons/io5";
import { FaMoneyBill1Wave } from "react-icons/fa6";
import { useLocation, Link } from "react-router-dom";

export default function BottomNav() {

  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: <IoHome />, label: "Home" },
    { path: "/records", icon: <IoTime />, label: "Records" },
    { path: "/earnings", icon: <FaMoneyBill1Wave />, label: "Earnings" },
    { path: "/settings", icon: <IoSettings />, label: "Settings" }
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-surface border-t border-gray-200 z-50">

      <div className="max-w-md mx-auto grid grid-cols-4">

        {navItems.map((item) => {

          const active = 
            location.pathname === item.path || 
            (item.path === "/dashboard" && location.pathname === "/");

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-3 text-sm transition
                ${active ? "text-primary" : "text-gray-400"}
              `}
            >

              {/* Icon */}
              <div className={`text-xl ${active ? "scale-110" : ""}`}>
                {item.icon}
              </div>

              {/* Label */}
              <span className="text-xs mt-1">
                {item.label}
              </span>

              {/* Active Indicator */}
              {active && (
                <div className="absolute bottom-0 h-1 w-10 bg-primary rounded-t-full"></div>
              )}

            </Link>
          );
        })}

      </div>

    </div>
  );
}