import { Check } from "lucide-react";
import { cn } from "../lib/cn";

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, className, disabled }: Props) {
  return (
    <label
      className={cn(
        "group inline-flex cursor-pointer select-none items-center gap-2.5 text-sm",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span className="relative inline-flex">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-md border transition-all",
            "border-zinc-300 bg-white",
            "group-hover:border-zinc-400",
            "peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:shadow-glow",
            "peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/20",
          )}
        >
          <Check
            className={cn(
              "h-3.5 w-3.5 text-white transition-all",
              checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
            strokeWidth={3}
          />
        </span>
      </span>
      {label && (
        <span
          className={cn(
            "text-zinc-700 transition-colors",
            checked && "text-zinc-500",
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
}
