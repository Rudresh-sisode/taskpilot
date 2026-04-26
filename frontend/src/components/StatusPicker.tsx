import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { STATUSES, getStatus, type TaskStatus } from "../lib/status";
import { cn } from "../lib/cn";

interface Props {
  value: TaskStatus;
  onChange: (next: TaskStatus) => void;
  disabled?: boolean;
}

export function StatusPicker({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = getStatus(value);
  const Icon = current.icon;

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "focus-ring inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 text-sm shadow-soft transition hover:bg-zinc-50",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        <Icon className={cn("h-4 w-4", current.iconColor)} />
        <span className="font-medium text-zinc-800">{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
      </button>

      <div
        role="listbox"
        className={cn(
          "absolute left-0 z-20 mt-2 w-56 origin-top-left rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg transition-all",
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
          Set status
        </p>
        {STATUSES.map((s) => {
          const SIcon = s.icon;
          const selected = s.value === value;
          return (
            <button
              key={s.value}
              role="option"
              aria-selected={selected}
              onClick={() => {
                onChange(s.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition",
                selected ? "bg-zinc-100" : "hover:bg-zinc-50",
              )}
            >
              <SIcon className={cn("h-4 w-4", s.iconColor)} />
              <span className="flex-1 text-zinc-800">{s.label}</span>
              {selected && <Check className="h-3.5 w-3.5 text-zinc-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
