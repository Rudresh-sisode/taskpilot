import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Plus, Search, Tags } from "lucide-react";
import { LABELS } from "../lib/labels";
import { LabelChip } from "./LabelChip";
import { cn } from "../lib/cn";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  /** show inline list of selected labels next to the trigger */
  inline?: boolean;
}

export function LabelPicker({ value, onChange, inline = true }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = useMemo(() => new Set(value), [value]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 10);
    function onDoc(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LABELS;
    return LABELS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.slug.includes(q) ||
        l.description.toLowerCase().includes(q),
    );
  }, [query]);

  function toggle(slug: string) {
    if (selected.has(slug)) onChange(value.filter((s) => s !== slug));
    else onChange([...value, slug]);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap items-center gap-1.5">
        {inline &&
          value.map((slug) => (
            <LabelChip
              key={slug}
              slug={slug}
              size="sm"
              onRemove={() => toggle(slug)}
            />
          ))}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "focus-ring inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-zinc-300 bg-white px-2.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-400 hover:text-zinc-900",
            value.length === 0 && "border-solid border-zinc-200",
          )}
        >
          {value.length === 0 ? (
            <>
              <Tags className="h-3 w-3" />
              Add labels
            </>
          ) : (
            <>
              <Plus className="h-3 w-3" />
              Label
            </>
          )}
        </button>
      </div>

      <div
        className={cn(
          "absolute left-0 z-30 mt-2 w-72 origin-top-left rounded-xl border border-zinc-200 bg-white shadow-lg transition-all",
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <div className="border-b border-zinc-100 p-2">
          <p className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            Apply labels
          </p>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter labels…"
              className="h-8 w-full rounded-md border border-zinc-200 bg-zinc-50/60 pl-8 pr-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/15"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-zinc-500">
              No labels match "{query}"
            </p>
          ) : (
            filtered.map((l) => {
              const isSel = selected.has(l.slug);
              return (
                <button
                  key={l.slug}
                  type="button"
                  onClick={() => toggle(l.slug)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left transition",
                    isSel ? "bg-zinc-50" : "hover:bg-zinc-50",
                  )}
                >
                  <span className="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                    {isSel ? (
                      <Check className="h-3.5 w-3.5 text-brand-600" strokeWidth={3} />
                    ) : (
                      <span
                        className={cn("h-2.5 w-2.5 rounded-full", l.dot)}
                      />
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-zinc-900">
                      {l.name}
                    </span>
                    <span className="block truncate text-xs text-zinc-500">
                      {l.description}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 px-3 py-2 text-[11px] text-zinc-400">
          <span>{value.length} selected</span>
          {value.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="font-medium text-zinc-500 hover:text-zinc-900"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
