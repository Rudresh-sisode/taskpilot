import { cn } from "../lib/cn";

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 via-violet-600 to-fuchsia-600 shadow-glow">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
          <path
            d="M5 12.5l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {withText && (
        <span className="text-base font-semibold tracking-tight text-zinc-900">
          TaskPilot
        </span>
      )}
    </div>
  );
}
