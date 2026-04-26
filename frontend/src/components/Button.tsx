import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base = "rounded px-4 py-2 text-sm font-medium transition disabled:opacity-50";
  const styles = variant === "ghost"
    ? "hover:bg-gray-100"
    : "bg-blue-600 text-white hover:bg-blue-700";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
