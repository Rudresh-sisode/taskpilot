/**
 * Catalog of labels available across all tasks.
 * Mirrors GitHub's label model: a fixed slug + colored chip.
 *
 * Tailwind needs static class strings, so each entry hardcodes the
 * background / text / ring classes rather than computing them at runtime.
 */
export interface LabelDef {
  slug: string;
  name: string;
  description: string;
  /** classes for solid filled chips (used in the popover) */
  solid: string;
  /** classes for soft chips (used inline on cards) */
  soft: string;
  /** small color swatch dot */
  dot: string;
}

export const LABELS: LabelDef[] = [
  {
    slug: "bug",
    name: "Bug",
    description: "Something isn't working",
    solid: "bg-red-500 text-white ring-red-600",
    soft: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },
  {
    slug: "feature",
    name: "Feature",
    description: "A new capability or enhancement",
    solid: "bg-emerald-500 text-white ring-emerald-600",
    soft: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    slug: "improvement",
    name: "Improvement",
    description: "Polish or refinement on existing work",
    solid: "bg-sky-500 text-white ring-sky-600",
    soft: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
  },
  {
    slug: "documentation",
    name: "Documentation",
    description: "Docs, README, or in-code comments",
    soft: "bg-blue-50 text-blue-700 ring-blue-200",
    solid: "bg-blue-500 text-white ring-blue-600",
    dot: "bg-blue-500",
  },
  {
    slug: "design",
    name: "Design",
    description: "Visual design, UX, or component work",
    soft: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
    solid: "bg-fuchsia-500 text-white ring-fuchsia-600",
    dot: "bg-fuchsia-500",
  },
  {
    slug: "research",
    name: "Research",
    description: "Spike, exploration, or open question",
    soft: "bg-violet-50 text-violet-700 ring-violet-200",
    solid: "bg-violet-500 text-white ring-violet-600",
    dot: "bg-violet-500",
  },
  {
    slug: "urgent",
    name: "Urgent",
    description: "Time-sensitive, needs attention now",
    soft: "bg-orange-50 text-orange-700 ring-orange-200",
    solid: "bg-orange-500 text-white ring-orange-600",
    dot: "bg-orange-500",
  },
  {
    slug: "blocked",
    name: "Blocked",
    description: "Waiting on something or someone else",
    soft: "bg-amber-50 text-amber-700 ring-amber-200",
    solid: "bg-amber-500 text-white ring-amber-600",
    dot: "bg-amber-500",
  },
  {
    slug: "good-first-task",
    name: "Good first task",
    description: "Approachable for newcomers",
    soft: "bg-lime-50 text-lime-700 ring-lime-200",
    solid: "bg-lime-500 text-white ring-lime-600",
    dot: "bg-lime-500",
  },
  {
    slug: "question",
    name: "Question",
    description: "Needs clarification or input",
    soft: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    solid: "bg-indigo-500 text-white ring-indigo-600",
    dot: "bg-indigo-500",
  },
  {
    slug: "tech-debt",
    name: "Tech debt",
    description: "Refactor or cleanup work",
    soft: "bg-zinc-100 text-zinc-700 ring-zinc-300",
    solid: "bg-zinc-700 text-white ring-zinc-800",
    dot: "bg-zinc-500",
  },
  {
    slug: "performance",
    name: "Performance",
    description: "Speed, memory, or efficiency",
    soft: "bg-yellow-50 text-yellow-800 ring-yellow-200",
    solid: "bg-yellow-500 text-white ring-yellow-600",
    dot: "bg-yellow-500",
  },
  {
    slug: "security",
    name: "Security",
    description: "Auth, secrets, or vulnerabilities",
    soft: "bg-rose-50 text-rose-700 ring-rose-200",
    solid: "bg-rose-500 text-white ring-rose-600",
    dot: "bg-rose-500",
  },
  {
    slug: "wont-fix",
    name: "Won't fix",
    description: "Out of scope or won't be addressed",
    soft: "bg-stone-100 text-stone-600 ring-stone-300",
    solid: "bg-stone-500 text-white ring-stone-600",
    dot: "bg-stone-500",
  },
  {
    slug: "duplicate",
    name: "Duplicate",
    description: "Already covered by another task",
    soft: "bg-slate-100 text-slate-600 ring-slate-300",
    solid: "bg-slate-500 text-white ring-slate-600",
    dot: "bg-slate-500",
  },
  {
    slug: "ai",
    name: "AI",
    description: "Tasks related to AI features or prompts",
    soft: "bg-purple-50 text-purple-700 ring-purple-200",
    solid: "bg-purple-500 text-white ring-purple-600",
    dot: "bg-purple-500",
  },
];

const BY_SLUG: Record<string, LabelDef> = LABELS.reduce(
  (acc, l) => {
    acc[l.slug] = l;
    return acc;
  },
  {} as Record<string, LabelDef>,
);

export function getLabel(slug: string): LabelDef | undefined {
  return BY_SLUG[slug];
}
