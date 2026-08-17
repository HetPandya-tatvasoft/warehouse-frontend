import { z } from "zod";
import { ProductCategoryStatus } from "../types/product-categories.types";

export const categoryUpsertSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(150, "Category name cannot exceed 150 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  status: z.enum(ProductCategoryStatus),
});

export type CategoryUpsertFormData = z.infer<typeof categoryUpsertSchema>;
