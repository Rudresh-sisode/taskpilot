import type { InputHTMLAttributes } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  onChange?: (value: string) => void;
}

export function Input({ label, onChange, className = "", ...props }: Props) {
  return (
    <div className={className}>
      {label && <label className="mb-1 block text-sm font-medium">{label}</label>}
      <input
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
    </div>
  );
}
