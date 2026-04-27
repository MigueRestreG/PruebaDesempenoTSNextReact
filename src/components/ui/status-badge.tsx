type StatusBadgeProps = {
  value: string;
  variant?: "success" | "warning" | "neutral" | "danger";
};

const variants: Record<NonNullable<StatusBadgeProps["variant"]>, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
};

export function StatusBadge({ value, variant = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${variants[variant]}`}
    >
      {value}
    </span>
  );
}
