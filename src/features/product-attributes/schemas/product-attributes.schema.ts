import { z } from "zod";
import { MESSAGES } from "@/shared/constants/messages";
import { ProductAttributeStatus } from "../types/product-attributes.types";

export const attributeUpsertSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, MESSAGES.PRODUCT_ATTRIBUTES.VALIDATION.NAME_REQUIRED)
    .max(150, MESSAGES.PRODUCT_ATTRIBUTES.VALIDATION.NAME_MAX_LENGTH),
  status: z.enum(ProductAttributeStatus),
});

export const attributeValueUpsertSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, MESSAGES.PRODUCT_ATTRIBUTE_VALUES.VALIDATION.LABEL_REQUIRED)
    .max(150, MESSAGES.PRODUCT_ATTRIBUTE_VALUES.VALIDATION.LABEL_MAX_LENGTH),
  status: z.enum(ProductAttributeStatus),
});

export type AttributeUpsertFormData = z.infer<typeof attributeUpsertSchema>;
export type AttributeValueUpsertFormData = z.infer<typeof attributeValueUpsertSchema>;

// Backward compatibility aliases
export const attributeFormSchema = attributeUpsertSchema;
export const attributeValueFormSchema = attributeValueUpsertSchema;
export type AttributeFormData = AttributeUpsertFormData;
export type AttributeValueFormData = AttributeValueUpsertFormData;
