import { X } from "lucide-react";
import { getLabel } from "../lib/labels";
import { cn } from "../lib/cn";

interface Props {
  slug: string;
  size?: "xs" | "sm";
  variant?: "soft" | "solid";
  onRemove?: () => void;
}

export function LabelChip({ slug, size = "xs", variant = "soft", onRemove }: Props) {
  const def = getLabel(slug);
  if (!def) {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 ring-1 ring-inset ring-zinc-200">
        {slug}
      </span>
    );
  }
  const palette = variant === "solid" ? def.solid : def.soft;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full ring-1 ring-inset font-medium",
        size === "xs" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        palette,
      )}
    >
      <span className={cn("inline-block rounded-full", size === "xs" ? "h-1.5 w-1.5" : "h-2 w-2", def.dot)} />
      {def.name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 -mr-1 rounded-full p-0.5 hover:bg-black/10"
          aria-label={`Remove ${def.name} label`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
