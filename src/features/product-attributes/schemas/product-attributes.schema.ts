import { z } from "zod";
import { ProductAttributeStatus } from "../types/product-attributes.types";

export const attributeUpsertSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Attribute name is required")
    .max(150, "Attribute name cannot exceed 150 characters"),
  status: z.enum(ProductAttributeStatus),
});

export const attributeValueUpsertSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Value label is required")
    .max(150, "Value label cannot exceed 150 characters"),
  status: z.enum(ProductAttributeStatus),
});

export type AttributeUpsertFormData = z.infer<typeof attributeUpsertSchema>;
export type AttributeValueUpsertFormData = z.infer<typeof attributeValueUpsertSchema>;

// Backward compatibility aliases
export const attributeFormSchema = attributeUpsertSchema;
export const attributeValueFormSchema = attributeValueUpsertSchema;
export type AttributeFormData = AttributeUpsertFormData;
export type AttributeValueFormData = AttributeValueUpsertFormData;
