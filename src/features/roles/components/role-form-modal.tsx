"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";

import { UIModal } from "@/components/common/UIModal/UIModal";
import { UIInput } from "@/components/common/UIInput/UIInput";
import { UITextarea } from "@/components/common/UITextarea/UITextarea";
import { UIButton } from "@/components/common/UIButton";

import {
  roleUpsertSchema,
  type RoleUpsertFormData,
} from "../schemas/roles.schema";
import { useCreateRole, useUpdateRole } from "../queries/roles.queries";
import type { IRole } from "../types/roles.types";

interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: IRole | null;
}

export function RoleFormModal({
  open,
  onOpenChange,
  role,
}: RoleFormModalProps) {
  const isEditing = Boolean(role);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleUpsertFormData>({
    resolver: zodResolver(roleUpsertSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { mutate: createRole, isPending: isCreating } = useCreateRole();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      reset({
        name: role?.name || "",
        description: role?.description || "",
      });
    }
  }, [open, role, reset]);

  const saveRole = (
    payload: RoleUpsertFormData,
    options: {
      onSuccess: () => void;
      onError: (error: unknown) => void;
    },
  ) => {
    if (role?.id) {
      updateRole({ id: role.id, payload }, options);
    } else {
      createRole(payload, options);
    }
  };

  const onSubmit = (formData: RoleUpsertFormData) => {
    const payload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
    };

    saveRole(payload, {
      onSuccess: () => {
        toast.success(`Role ${role?.id ? "updated" : "created"} successfully`);
        onOpenChange(false);
        reset();
      },
      onError: (error) => {
        const action = role?.id ? "update" : "create";
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || `Failed to ${action} role`,
          );
        } else {
          toast.error("Something went wrong, please try again");
        }
      },
    });
  };

  return (
    <UIModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Role" : "Create New Role"}
      description={
        isEditing
          ? "Update the details for this role."
          : "Add a new role to manage user permissions."
      }
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
      showCloseButton={!isPending}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <UIButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </UIButton>
          <UIButton
            type="button"
            onClick={handleSubmit(onSubmit)}
            loading={isPending}
          >
            {isEditing ? "Save Changes" : "Create Role"}
          </UIButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
        <UIInput
          label="Role Name"
          required
          placeholder="e.g. Warehouse Manager"
          error={errors.name?.message}
          disabled={isPending}
          {...register("name")}
        />

        <UITextarea
          label="Description"
          placeholder="Brief description of the role responsibilities..."
          error={errors.description?.message}
          disabled={isPending}
          rows={3}
          {...register("description")}
        />
      </form>
    </UIModal>
  );
}
