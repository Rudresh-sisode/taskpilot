import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: ReactNode;
}

const toneStyles: Record<Tone, string> = {
  neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
};

export function Badge({ tone = "neutral", icon, className, children, ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </span>
  );
}
