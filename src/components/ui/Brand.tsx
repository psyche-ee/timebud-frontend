import Logo from "../../assets/logo.svg";

interface BrandProps {
  compact?: boolean;
}

export default function Brand({ compact = false }: BrandProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
        <img src={Logo} alt="" className="h-6 w-6" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Time<span className="text-primary">Bud</span>
        </span>
      )}
    </span>
  );
}
