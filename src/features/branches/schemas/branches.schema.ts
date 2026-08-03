import { z } from "zod";
import { BranchStatus } from "../types/branches.types";

export const branchUpsertSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Branch name is required")
    .max(150, "Branch name cannot exceed 150 characters"),
  status: z.nativeEnum(BranchStatus),
  addressLine1: z.string().max(255).optional().or(z.literal('')),
  addressLine2: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
});

export type BranchUpsertFormData = z.infer<typeof branchUpsertSchema>;
