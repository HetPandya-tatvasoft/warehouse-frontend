import { z } from "zod";
import { MESSAGES } from "@/shared/constants/messages";
import { BrandStatus } from "../types/brands.types";

export const brandUpsertSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, MESSAGES.PRODUCT_BRANDS.VALIDATION.NAME_REQUIRED)
    .max(150, MESSAGES.PRODUCT_BRANDS.VALIDATION.NAME_MAX_LENGTH),
  status: z.enum(BrandStatus),
});

export type BrandUpsertFormData = z.infer<typeof brandUpsertSchema>;

export const brandFormSchema = brandUpsertSchema;
export type BrandFormData = BrandUpsertFormData;
