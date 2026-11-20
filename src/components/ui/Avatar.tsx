import type { SessionUser } from "../../lib/auth";
import { initials } from "../../lib/format";

interface AvatarProps {
  user?: SessionUser;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-2xl",
};

export default function Avatar({
  user,
  size = "md",
  className = "",
}: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-sky-500 font-bold text-white shadow-sm ring-2 ring-card ${sizes[size]} ${className}`}
    >
      {initials(user?.f_name, user?.l_name)}
    </span>
  );
}
