import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/cn";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  onChange?: (value: string) => void;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, error, leftIcon, rightSlot, onChange, className, containerClassName, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            "h-10 w-full rounded-lg border bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition-shadow",
            "focus:outline-none focus:ring-4",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
              : "border-zinc-200 focus:border-brand-500 focus:ring-brand-500/15",
            leftIcon && "pl-9",
            rightSlot && "pr-10",
            className,
          )}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-zinc-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
