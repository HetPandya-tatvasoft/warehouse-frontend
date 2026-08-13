import { z } from "zod";
import { WarehouseStatus } from "../types/warehouses.types";

export const warehouseContactSchema = z.object({
  id: z.string().optional(),
  userId: z.string().nullable().optional(),
  fullName: z
    .string()
    .min(1, "Full Name is required")
    .max(150, "Full Name cannot exceed 150 characters"),
  email: z.email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .max(20, "Phone number cannot exceed 20 characters"),
  isDefault: z.boolean(),
});

export const warehouseUpsertSchema = z
  .object({
    name: z
      .string()
      .min(1, "Warehouse Name is required")
      .max(150, "Warehouse Name cannot exceed 150 characters"),
    code: z
      .string()
      .min(1, "Warehouse Code is required")
      .max(50, "Warehouse Code cannot exceed 50 characters"),
    status: z.enum(WarehouseStatus),
    isDefault: z.boolean(),
    addressLine1: z
      .string()
      .min(1, "Address Line 1 is required")
      .max(255, "Address Line 1 cannot exceed 255 characters"),
    addressLine2: z
      .string()
      .max(255, "Address Line 2 cannot exceed 255 characters")
      .optional()
      .or(z.literal("")),
    countryId: z
      .number({ message: "Country is required" })
      .int()
      .positive("Country is required"),
    stateId: z
      .number({ message: "State is required" })
      .int()
      .positive("State is required"),
    cityId: z
      .number({ message: "City is required" })
      .int()
      .positive("City is required"),
    postalCode: z
      .string()
      .min(1, "Postal Code is required")
      .max(20, "Postal Code cannot exceed 20 characters"),
    contacts: z
      .array(warehouseContactSchema)
      .min(1, "At least 1 contact person is required"),
  })
  .superRefine((data, ctx) => {
    // 1. Validate exactly one default contact
    const defaultCount = data.contacts.filter((c) => c.isDefault).length;
    if (defaultCount !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["contacts"],
        message: "Exactly one contact must be set as default.",
      });
    }

    // 2. Validate duplicate contact combinations (same Name + Phone or same Name + Email)
    const seenNamePhone = new Set<string>();
    const seenNameEmail = new Set<string>();

    data.contacts.forEach((c, idx) => {
      const name = c.fullName?.toLowerCase().trim() || "";
      const phone = c.phone?.trim() || "";
      const email = c.email?.toLowerCase().trim() || "";

      if (name) {
        if (phone) {
          const namePhoneKey = `${name}_${phone}`;
          if (seenNamePhone.has(namePhoneKey)) {
            ctx.addIssue({
              code: "custom",
              path: ["contacts", idx, "phone"],
              message:
                "Duplicate contact person (same Name and Phone combination) is not allowed.",
            });
          }
          seenNamePhone.add(namePhoneKey);
        }

        if (email) {
          const nameEmailKey = `${name}_${email}`;
          if (seenNameEmail.has(nameEmailKey)) {
            ctx.addIssue({
              code: "custom",
              path: ["contacts", idx, "email"],
              message:
                "Duplicate contact person (same Name and Email combination) is not allowed.",
            });
          }
          seenNameEmail.add(nameEmailKey);
        }
      }
    });
  });

export type WarehouseUpsertFormData = z.infer<typeof warehouseUpsertSchema>;
export type WarehouseContactFormData = z.infer<typeof warehouseContactSchema>;

export const generalInfoSchema = z.object({
  name: z
    .string()
    .min(1, "Warehouse Name is required")
    .max(150, "Warehouse Name cannot exceed 150 characters"),
  code: z
    .string()
    .min(1, "Warehouse Code is required")
    .max(50, "Warehouse Code cannot exceed 50 characters"),
  status: z.enum(WarehouseStatus),
  isDefault: z.boolean(),
});
export type GeneralInfoFormData = z.infer<typeof generalInfoSchema>;

export const addressSchema = z.object({
  addressLine1: z
    .string()
    .min(1, "Address Line 1 is required")
    .max(255, "Address Line 1 cannot exceed 255 characters"),
  addressLine2: z
    .string()
    .max(255, "Address Line 2 cannot exceed 255 characters")
    .optional()
    .or(z.literal("")),
  countryId: z
    .number({ message: "Country is required" })
    .int()
    .positive("Country is required"),
  stateId: z
    .number({ message: "State is required" })
    .int()
    .positive("State is required"),
  cityId: z
    .number({ message: "City is required" })
    .int()
    .positive("City is required"),
  postalCode: z
    .string()
    .min(1, "Postal Code is required")
    .max(20, "Postal Code cannot exceed 20 characters"),
});
export type AddressFormData = z.infer<typeof addressSchema>;

export const contactsFormSchema = z
  .object({
    contacts: z
      .array(warehouseContactSchema)
      .min(1, "At least 1 contact person is required"),
  })
  .superRefine((data, ctx) => {
    // 1. Validate exactly one default contact
    const defaultCount = data.contacts.filter((c) => c.isDefault).length;
    if (defaultCount !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["contacts"],
        message: "Exactly one contact must be set as default.",
      });
    }

    // 2. Validate duplicate contact combinations
    const contactKeys = data.contacts.map(
      (c) => `${c.fullName.toLowerCase().trim()}_${c.phone.trim()}`,
    );
    const uniqueKeys = new Set(contactKeys);
    if (uniqueKeys.size !== data.contacts.length) {
      ctx.addIssue({
        code: "custom",
        path: ["contacts"],
        message:
          "Duplicate contact person (same Name and Phone combination) is not allowed.",
      });
    }
  });
export type ContactsFormData = z.infer<typeof contactsFormSchema>;
