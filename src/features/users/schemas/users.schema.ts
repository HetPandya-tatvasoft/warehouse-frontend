import { z } from "zod";

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be less than 100 characters"),
  roleIds: z
    .array(z.string().uuid("Invalid role ID"))
    .min(1, "At least one role must be assigned"),
  branchIds: z
    .array(z.string().uuid("Invalid branch ID"))
    .min(1, "At least one branch must be assigned"),
  primaryBranchId: z.string().uuid("Invalid primary branch ID"),
  isActive: z.boolean(),
}).refine((data) => data.branchIds.includes(data.primaryBranchId), {
  message: "Primary branch must be one of the assigned branches",
  path: ["primaryBranchId"],
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be less than 100 characters"),
  roleIds: z
    .array(z.string().uuid("Invalid role ID"))
    .min(1, "At least one role must be assigned"),
  branchIds: z.array(z.string().uuid("Invalid branch ID")).optional(),
  primaryBranchId: z.string().uuid("Invalid primary branch ID").optional(),
  isActive: z.boolean(),
})
  .refine(
    (data) => {
      const hasBranchIds = !!data.branchIds && data.branchIds.length > 0;
      const hasPrimary = !!data.primaryBranchId;
      return hasBranchIds === hasPrimary;
    },
    {
      message: "Both branch assignments and a primary branch must be supplied together",
      path: ["primaryBranchId"],
    }
  )
  .refine(
    (data) => {
      if (data.branchIds && data.primaryBranchId) {
        return data.branchIds.includes(data.primaryBranchId);
      }
      return true;
    },
    {
      message: "Primary branch must be one of the assigned branches",
      path: ["primaryBranchId"],
    }
  );

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
