"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import type { IApiSuccessResponse } from "@/types/api.types";

import { UIModal } from "@/components/common/UIModal/UIModal";
import { UIInput } from "@/components/common/UIInput/UIInput";
import { UITextarea } from "@/components/common/UITextarea/UITextarea";
import { UISelect } from "@/components/common/UISelect/UISelect";
import { UIButton } from "@/components/common/UIButton";

import {
  categoryUpsertSchema,
  type CategoryUpsertFormData,
} from "../schemas/product-categories.schema";
import {
  ProductCategoryStatus,
  type ICategory,
} from "../types/product-categories.types";
import {
  useCreateCategory,
  useUpdateCategory,
} from "../queries/product-categories.queries";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ICategory | null;
  parentId?: string | null;
  parentName?: string;
  onSuccess?: () => void;
}

interface StatusOption {
  label: string;
  value: ProductCategoryStatus;
}

const statusOptions: StatusOption[] = [
  { label: "Active", value: ProductCategoryStatus.ACTIVE },
  { label: "Inactive", value: ProductCategoryStatus.INACTIVE },
];

export function CategoryFormModal({
  open,
  onOpenChange,
  category,
  parentId,
  parentName,
  onSuccess,
}: CategoryFormModalProps) {
  const isEditing = Boolean(category);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoryUpsertFormData>({
    resolver: zodResolver(categoryUpsertSchema),
    defaultValues: {
      name: "",
      description: "",
      status: ProductCategoryStatus.ACTIVE,
    },
  });

  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name || "",
        description: category?.description || "",
        status: category?.status || ProductCategoryStatus.ACTIVE,
      });
    }
  }, [open, category, reset]);

  const onSubmit = (formData: CategoryUpsertFormData) => {
    const payload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      status: formData.status,
      ...(!category?.id ? { parentId: parentId || null } : {}),
    };

    const options = {
      onSuccess: (res: IApiSuccessResponse<ICategory>) => {
        toast.success(
          res?.message ||
            (category?.id
              ? MESSAGES.PRODUCT_CATEGORIES.UPDATE_SUCCESS
              : MESSAGES.PRODUCT_CATEGORIES.CREATE_SUCCESS),
        );
        onOpenChange(false);
        reset();
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (err: unknown) => {
        if (axios.isAxiosError(err)) {
          toast.error(
            err.response?.data?.message ||
              (category?.id
                ? MESSAGES.PRODUCT_CATEGORIES.UPDATE_FAILED
                : MESSAGES.PRODUCT_CATEGORIES.CREATE_FAILED),
          );
        } else {
          toast.error(MESSAGES.COMMON.SOMETHING_WENT_WRONG);
        }
      },
    };

    if (category?.id) {
      updateCategory({ id: category.id, payload }, options);
    } else {
      createCategory(payload, options);
    }
  };

  return (
    <UIModal
      open={open}
      onOpenChange={onOpenChange}
      title={
        isEditing
          ? TITLES.PRODUCT_CATEGORIES.EDIT_CATEGORY
          : TITLES.PRODUCT_CATEGORIES.CREATE_NEW_CATEGORY
      }
      description={
        isEditing
          ? "Update the details for this product category."
          : "Add a new product category to organize your products."
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
            {isEditing ? "Save Changes" : "Create Category"}
          </UIButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
        {parentId && parentName && (
          <UIInput
            label="Parent Category"
            value={parentName}
            disabled
          />
        )}

        <UIInput
          label="Category Name"
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

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <UISelect<StatusOption, ProductCategoryStatus>
              mode="single"
              label="Status"
              required
              options={statusOptions}
              getOptionLabel={(opt) => opt.label}
              getOptionValue={(opt) => opt.value}
              value={field.value}
              onValueChange={field.onChange}
              error={errors.status?.message}
              disabled={isPending}
            />
          )}
        />
      </form>
    </UIModal>
  );
}
