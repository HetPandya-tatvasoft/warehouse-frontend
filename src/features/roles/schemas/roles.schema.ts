import { z } from "zod";

export const roleUpsertSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Role name is required")
    .max(100, "Role name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(255, "Description cannot exceed 255 characters")
    .optional()
    .or(z.literal("")),
});

export type RoleUpsertFormData = z.infer<typeof roleUpsertSchema>;
