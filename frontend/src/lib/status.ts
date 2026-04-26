import { CheckCircle2, Circle, CircleDashed, XCircle, type LucideIcon } from "lucide-react";

export type TaskStatus = "open" | "in_progress" | "done" | "cancelled";

export interface StatusDef {
  value: TaskStatus;
  label: string;
  icon: LucideIcon;
  /** chip background + text */
  chip: string;
  /** standalone icon color */
  iconColor: string;
  /** small color dot */
  dot: string;
}

export const STATUSES: StatusDef[] = [
  {
    value: "open",
    label: "Open",
    icon: Circle,
    chip: "bg-zinc-100 text-zinc-700 ring-zinc-200",
    iconColor: "text-zinc-400",
    dot: "bg-zinc-400",
  },
  {
    value: "in_progress",
    label: "In progress",
    icon: CircleDashed,
    chip: "bg-sky-50 text-sky-700 ring-sky-200",
    iconColor: "text-sky-500",
    dot: "bg-sky-500",
  },
  {
    value: "done",
    label: "Done",
    icon: CheckCircle2,
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    iconColor: "text-emerald-500",
    dot: "bg-emerald-500",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    chip: "bg-zinc-100 text-zinc-500 ring-zinc-200",
    iconColor: "text-zinc-400",
    dot: "bg-zinc-400",
  },
];

const BY_VALUE: Record<TaskStatus, StatusDef> = STATUSES.reduce(
  (acc, s) => {
    acc[s.value] = s;
    return acc;
  },
  {} as Record<TaskStatus, StatusDef>,
);

export function getStatus(value: TaskStatus): StatusDef {
  return BY_VALUE[value] ?? BY_VALUE.open;
}
