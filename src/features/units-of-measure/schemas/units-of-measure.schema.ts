import { z } from "zod";
import { MESSAGES } from "@/shared/constants/messages";
import { UnitOfMeasureStatus } from "../types/units-of-measure.types";

export const unitOfMeasureFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, MESSAGES.PRODUCT_UNITS_OF_MEASURE.VALIDATION.NAME_REQUIRED)
    .max(150, MESSAGES.PRODUCT_UNITS_OF_MEASURE.VALIDATION.NAME_MAX_LENGTH),
  code: z
    .string()
    .trim()
    .min(1, MESSAGES.PRODUCT_UNITS_OF_MEASURE.VALIDATION.CODE_REQUIRED)
    .max(20, MESSAGES.PRODUCT_UNITS_OF_MEASURE.VALIDATION.CODE_MAX_LENGTH),
  allowsFractionalQuantity: z.boolean(),
  status: z.enum(UnitOfMeasureStatus),
});

export type UnitOfMeasureFormData = z.infer<typeof unitOfMeasureFormSchema>;
