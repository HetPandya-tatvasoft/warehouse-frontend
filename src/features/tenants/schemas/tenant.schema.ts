import { z } from "zod";

export const tenantOnboardingSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company Name is required")
    .max(150, "Company Name cannot exceed 150 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  branchName: z
    .string()
    .min(1, "Branch Name is required")
    .max(150, "Branch Name cannot exceed 150 characters"),
  companyEmail: z
    .string()
    .min(1, "Company Email is required")
    .email("Invalid email format"),
  companyPhone: z.string().min(1, "Company Phone is required"),
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional().or(z.literal("")),
  countryId: z
    .number()
    .optional()
    .refine((val) => val !== undefined && val !== null, {
      message: "Country is required",
    }),
  stateId: z
    .number()
    .optional()
    .refine((val) => val !== undefined && val !== null, {
      message: "State is required",
    }),
  cityId: z
    .number()
    .optional()
    .refine((val) => val !== undefined && val !== null, {
      message: "City is required",
    }),
  postalCode: z.string().min(1, "Postal Code is required"),
  primaryAdministrator: z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z
      .string()
      .min(1, "Admin Email is required")
      .email("Invalid email format"),
  }),
});

export interface TenantOnboardingFormValues {
  companyName: string;
  slug: string;
  branchName: string;
  companyEmail: string;
  companyPhone: string;
  addressLine1: string;
  addressLine2?: string;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  postalCode: string;
  primaryAdministrator: {
    firstName: string;
    lastName: string;
    email: string;
  };
}
