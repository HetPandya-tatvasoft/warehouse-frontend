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
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";

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
        toast.success(
          role?.id
            ? MESSAGES.ROLES.UPDATE_SUCCESS
            : MESSAGES.ROLES.CREATE_SUCCESS,
        );
        onOpenChange(false);
        reset();
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message ||
              (role?.id
                ? MESSAGES.ROLES.UPDATE_FAILED
                : MESSAGES.ROLES.CREATE_FAILED),
          );
        } else {
          toast.error(MESSAGES.COMMON.SOMETHING_WENT_WRONG);
        }
      },
    });
  };

  return (
    <UIModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? TITLES.ROLES.EDIT_ROLE : TITLES.ROLES.CREATE_NEW_ROLE}
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
          error={errors.name?.message}
          disabled={isPending}
          {...register("name")}
        />

        <UITextarea
          label="Description"
          error={errors.description?.message}
          disabled={isPending}
          rows={3}
          {...register("description")}
        />
      </form>
    </UIModal>
  );
}
