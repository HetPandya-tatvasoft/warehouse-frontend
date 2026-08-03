"use client";

import { useEffect } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { UIInput } from "@/components/common/UIInput/UIInput";
import { UIButton } from "@/components/common/UIButton";

import { useRoles } from "@/features/roles/queries/roles.queries";
import { useBranches } from "@/features/branches/queries/branches.queries";
import type { IBranch } from "@/features/branches/types/branches.types";
import { useCreateUser, useUpdateUser } from "../queries/users.queries";
import type { IUser, IUserRole } from "../types/users.types";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormValues,
  type UpdateUserFormValues,
} from "../schemas/users.schema";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";

interface UserFormProps {
  mode: "create" | "update";
  user?: IUser | null;
}

export function UserForm({ mode, user }: UserFormProps) {
  const isEditing = mode === "update";
  const router = useRouter();

  const { data: rolesData, isLoading: isLoadingRoles } = useRoles({
    page: 1,
    pageSize: 100,
  });

  const { data: branchesData, isLoading: isLoadingBranches } = useBranches({
    page: 1,
    pageSize: 100,
  });

  const availableRoles = (rolesData?.items || []) as IUserRole[];
  const availableBranches = branchesData?.items || [];

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema) as unknown as Resolver<CreateUserFormValues>,
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      roleIds: [],
      branchIds: [],
      primaryBranchId: "",
      isActive: true,
    },
  });

  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (isEditing && user) {
      const primaryBranch = user.branches?.find((b) => b.isPrimary);
      form.reset({
        email: user.email,
        password: "", // Not modified/shown during editing
        firstName: user.firstName,
        lastName: user.lastName,
        roleIds: user.roles?.map((r) => r.id) || [],
        branchIds: user.branches?.map((b) => b.id) || [],
        primaryBranchId: primaryBranch?.id || "",
        isActive: user.isActive,
      });
    }
  }, [isEditing, user, form]);

  const selectedRoleIds = useWatch({
    control: form.control,
    name: "roleIds",
  }) || [];

  const selectedBranchIds = useWatch({
    control: form.control,
    name: "branchIds",
  }) || [];

  const primaryBranchId = useWatch({
    control: form.control,
    name: "primaryBranchId",
  }) || "";

  const isActiveValue = useWatch({
    control: form.control,
    name: "isActive",
  });

  const handleRoleToggle = (roleId: string) => {
    const currentRoleIds = selectedRoleIds;
    const newRoleIds = currentRoleIds.includes(roleId)
      ? currentRoleIds.filter((id) => id !== roleId)
      : [...currentRoleIds, roleId];

    form.setValue("roleIds", newRoleIds, { shouldValidate: true });
  };

  const handleBranchToggle = (branchId: string) => {
    const currentBranchIds = selectedBranchIds;
    let newBranchIds: string[];

    if (currentBranchIds.includes(branchId)) {
      newBranchIds = currentBranchIds.filter((id) => id !== branchId);
      if (primaryBranchId === branchId) {
        form.setValue("primaryBranchId", newBranchIds[0] || "", { shouldValidate: true });
      }
    } else {
      newBranchIds = [...currentBranchIds, branchId];
      if (!primaryBranchId) {
        form.setValue("primaryBranchId", branchId, { shouldValidate: true });
      }
    }

    form.setValue("branchIds", newBranchIds, { shouldValidate: true });
  };

  const saveUser = (
    payload: CreateUserFormValues,
    options: {
      onSuccess: () => void;
      onError: (error: unknown) => void;
    },
  ) => {
    if (isEditing && user) {
      const updatePayload: UpdateUserFormValues = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        roleIds: payload.roleIds,
        branchIds: payload.branchIds,
        primaryBranchId: payload.primaryBranchId,
        isActive: payload.isActive,
      };
      updateUser(
        { id: user.id, payload: updatePayload },
        options,
      );
    } else {
      createUser(payload, options);
    }
  };

  const onSubmit = (formData: CreateUserFormValues) => {
    saveUser(formData, {
      onSuccess: () => {
        toast.success(
          isEditing
            ? MESSAGES.USERS.UPDATE_SUCCESS
            : MESSAGES.USERS.CREATE_SUCCESS,
        );
        router.push("/users");
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message ||
              (isEditing
                ? MESSAGES.USERS.UPDATE_FAILED
                : MESSAGES.USERS.CREATE_FAILED),
          );
        } else {
          toast.error(MESSAGES.COMMON.SOMETHING_WENT_WRONG);
        }
      },
    });
  };

  const roleError = form.formState.errors.roleIds?.message;
  const branchError = form.formState.errors.branchIds?.message || form.formState.errors.primaryBranchId?.message;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {isEditing ? TITLES.USERS.EDIT_USER_ACCOUNT : TITLES.USERS.CREATE_NEW_USER}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {isEditing
            ? "Update user details, assigned roles, and branch memberships."
            : "Add a new user to your tenant organization. Credentials will be emailed to them."}
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="p-6 space-y-6"
      >
        {!isEditing && (
          <div className="space-y-4">
            <UIInput
              label="Email Address"
              type="email"
              required
              error={form.formState.errors.email?.message}
              disabled={isPending}
              {...form.register("email")}
            />

            <UIInput
              label="Initial Password"
              type="password"
              required
              error={form.formState.errors.password?.message}
              disabled={isPending}
              {...form.register("password")}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UIInput
            label="First Name"
            required
            error={form.formState.errors.firstName?.message}
            disabled={isPending}
            {...form.register("firstName")}
          />

          <UIInput
            label="Last Name"
            required
            error={form.formState.errors.lastName?.message}
            disabled={isPending}
            {...form.register("lastName")}
          />
        </div>

        {/* Roles Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Assign Roles <span className="text-rose-500">*</span>
          </label>

          {isLoadingRoles ? (
            <p className="text-xs text-zinc-500">Loading available roles...</p>
          ) : availableRoles.length === 0 ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              No roles found. Please create roles first.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50">
              {availableRoles.map((role: IUserRole) => {
                const isSelected = selectedRoleIds.includes(role.id);
                return (
                  <label
                    key={role.id}
                    className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-medium"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleRoleToggle(role.id)}
                      disabled={isPending}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <div className="truncate">
                      <p className="font-semibold truncate">{role.name}</p>
                      {role.description && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {roleError && (
            <p className="text-xs font-medium text-rose-500">{roleError}</p>
          )}
        </div>

        {/* Branches Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Assign Branches <span className="text-rose-500">*</span>
          </label>

          {isLoadingBranches ? (
            <p className="text-xs text-zinc-500">Loading available branches...</p>
          ) : availableBranches.length === 0 ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              No branches found. Please create branches first.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50">
              {availableBranches.map((branch: IBranch) => {
                const isSelected = selectedBranchIds.includes(branch.id);
                const isPrimary = primaryBranchId === branch.id;
                return (
                  <div
                    key={branch.id}
                    className={`flex items-center justify-between p-2.5 rounded-md border text-xs transition-colors ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 font-medium"
                        : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <label className="flex items-center gap-3.5 cursor-pointer flex-1 py-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleBranchToggle(branch.id)}
                        disabled={isPending}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5"
                      />
                      <div>
                        <p className="font-semibold">{branch.name}</p>
                        {branch.city && (
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            {branch.city}, {branch.state || branch.country}
                          </p>
                        )}
                      </div>
                    </label>

                    {isSelected && (
                      <button
                        type="button"
                        onClick={() => form.setValue("primaryBranchId", branch.id, { shouldValidate: true })}
                        disabled={isPending}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all ${
                          isPrimary
                            ? "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-2xs"
                            : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <span className={isPrimary ? "text-amber-500" : "text-zinc-400"}>★</span>
                        {isPrimary ? "Primary Branch" : "Set as Primary"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {branchError && (
            <p className="text-xs font-medium text-rose-500">{branchError}</p>
          )}
        </div>

        {/* Is Active Status Checkbox */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isActive"
            disabled={isPending}
            checked={Boolean(isActiveValue)}
            onChange={(e) => {
              form.setValue("isActive", e.target.checked);
            }}
            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
          />
          <label
            htmlFor="isActive"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
          >
            Active Account
          </label>
        </div>

        {/* Footer / Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
          <UIButton
            type="button"
            variant="outline"
            onClick={() => router.push("/users")}
            disabled={isPending}
          >
            Cancel
          </UIButton>
          <UIButton type="submit" loading={isPending}>
            {isEditing ? "Save Changes" : "Create User"}
          </UIButton>
        </div>
      </form>
    </div>
  );
}
