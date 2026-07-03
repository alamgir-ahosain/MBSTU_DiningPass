import type { LucideIcon } from "lucide-react";

export function Stat({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "default" | "success" | "muted";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "muted"
        ? "text-muted-foreground"
        : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <div className={`mt-2 font-display text-2xl ${toneClass}`}>{value}</div>
    </div>
  );
}