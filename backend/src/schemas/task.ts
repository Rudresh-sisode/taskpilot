import { z } from "zod";

export const taskStatusSchema = z.enum([
  "open",
  "in_progress",
  "done",
  "cancelled",
]);

const labelSlug = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-z0-9-]+$/, "labels must be lowercase slugs");

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().default(""),
  labels: z.array(labelSlug).max(20).default([]),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  notes: z.string().optional(),
  status: taskStatusSchema.optional(),
  labels: z.array(labelSlug).max(20).optional(),
});
