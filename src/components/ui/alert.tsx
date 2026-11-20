import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type AlertVariant = "default" | "warning" | "destructive" | "success";

const variantClasses: Record<AlertVariant, string> = {
  default:
    "border-border bg-secondary/50 text-foreground [&>svg]:text-muted-foreground",
  warning:
    "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
  destructive:
    "border-destructive/30 bg-destructive/10 text-destructive [&>svg]:text-destructive",
  success:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400",
};

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

export function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "relative flex w-full items-start gap-3 rounded-xl border p-3.5 text-xs leading-relaxed",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn("font-semibold", className)} {...props} />;
}

export function AlertDescription({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-xs", className)} {...props} />;
}
