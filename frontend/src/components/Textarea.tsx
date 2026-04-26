import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

interface Props extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label?: string;
  hint?: string;
  onChange?: (value: string) => void;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { label, hint, onChange, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          "w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-shadow",
          "focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15",
          className,
        )}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
});
