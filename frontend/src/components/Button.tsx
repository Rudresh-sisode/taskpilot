import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-zinc-900 text-white shadow-soft hover:bg-zinc-800 active:scale-[0.98] disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none",
  secondary:
    "bg-white text-zinc-900 border border-zinc-200 shadow-soft hover:bg-zinc-50 active:scale-[0.98]",
  ghost: "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
  destructive:
    "bg-red-600 text-white shadow-soft hover:bg-red-700 active:scale-[0.98]",
  outline:
    "border border-zinc-200 bg-transparent text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-9 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-5 text-sm gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className, loading, leftIcon, rightIcon, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center font-medium transition-all duration-150 focus-ring disabled:cursor-not-allowed disabled:active:scale-100",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        leftIcon && <span className="-ml-0.5 inline-flex">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="-mr-0.5 inline-flex">{rightIcon}</span>}
    </button>
  );
});
