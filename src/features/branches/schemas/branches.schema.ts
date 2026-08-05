import { z } from "zod";
import { BranchStatus } from "../types/branches.types";

export const branchUpsertSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Branch name is required")
    .max(150, "Branch name cannot exceed 150 characters"),
  status: z.nativeEnum(BranchStatus),
  addressLine1: z.string().max(255).optional().or(z.literal("")),
  addressLine2: z.string().max(255).optional().or(z.literal("")),
  cityId: z.number().optional().nullable(),
  stateId: z.number().optional().nullable(),
  countryId: z.number().optional().nullable(),
  postalCode: z.string().max(20).optional().or(z.literal("")),
});

export type BranchUpsertFormData = z.infer<typeof branchUpsertSchema>;
