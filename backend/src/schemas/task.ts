import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().default(""),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  notes: z.string().optional(),
  status: z.enum(["open", "done"]).optional(),
});
