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
  companyEmail: z
    .string()
    .min(1, "Company Email is required")
    .email("Invalid email format"),
  companyPhone: z.string().min(1, "Company Phone is required"),
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional().or(z.literal("")),
  country: z.enum(
    ["India", "United States", "Canada", "United Kingdom", "Australia"],
    {
      message: "Please select an allowed country",
    },
  ),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
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

export type TenantOnboardingFormValues = z.infer<typeof tenantOnboardingSchema>;
