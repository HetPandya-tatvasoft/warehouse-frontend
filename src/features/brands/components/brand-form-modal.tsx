"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";

import type { IApiErrorResponse } from "@/types/api.types";
import { UIModal, UIInput, UISelect, UIButton } from "@/components/common";
import { Page, Permission, usePermissions } from "@/permissions";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";
import {
  brandUpsertSchema,
  type BrandUpsertFormData,
} from "../schemas/brands.schema";
import {
  BRAND_STATUS_OPTIONS,
  BrandStatus,
  type IBrand,
  type StatusOption,
} from "../types/brands.types";
import { useCreateBrand, useUpdateBrand } from "../queries/brands.queries";

interface BrandFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: IBrand | null;
}

export function BrandFormModal({
  open,
  onOpenChange,
  brand,
}: BrandFormModalProps) {
  const isEditing = Boolean(brand);
  const { can } = usePermissions();

  const isPermitted =
    can(Page.Brands, Permission.VIEW) &&
    can(Page.Brands, isEditing ? Permission.UPDATE : Permission.CREATE);

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandUpsertFormData>({
    resolver: zodResolver(brandUpsertSchema),
    defaultValues: {
      name: "",
      status: BrandStatus.ACTIVE,
    },
  });

  const { mutate: createBrand, isPending: isCreating } = useCreateBrand();
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand();

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      reset({
        name: brand?.name ?? "",
        status: brand?.status ?? BrandStatus.ACTIVE,
      });
    }
  }, [open, brand, reset]);

  const onSubmit = (data: BrandUpsertFormData) => {
    if (isPending || !isPermitted) return;

    const payload = {
      name: data.name.trim(),
      status: data.status,
    };

    const options = {
      onSuccess: (res: { message?: string }) => {
        toast.success(res?.message);
        onOpenChange(false);
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError<IApiErrorResponse>(error)) {
          if (error.response?.status !== 403) {
            toast.error(
              error.response?.data?.message || MESSAGES.COMMON.UNEXPECTED_ERROR,
            );
          }
        } else {
          toast.error(MESSAGES.COMMON.UNEXPECTED_ERROR);
        }
      },
    };

    if (brand?.id) {
      updateBrand({ id: brand.id, payload }, options);
    } else {
      createBrand(payload, options);
    }
  };

  return (
    <UIModal
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next);
      }}
      title={
        isEditing
          ? TITLES.PRODUCT_BRANDS.EDIT_BRAND
          : TITLES.PRODUCT_BRANDS.CREATE_NEW_BRAND
      }
      description={
        isEditing
          ? MESSAGES.PRODUCT_BRANDS.MODAL_EDIT_DESCRIPTION
          : MESSAGES.PRODUCT_BRANDS.MODAL_CREATE_DESCRIPTION
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
            type="submit"
            form="brand-form"
            loading={isPending}
            disabled={!isPermitted}
          >
            {isEditing ? "Save Changes" : "Create Brand"}
          </UIButton>
        </div>
      }
    >
      <form
        id="brand-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 py-2"
      >
        <UIInput
          label="Brand Name"
          required
          error={errors.name?.message}
          disabled={isPending || !isPermitted}
          {...register("name")}
        />

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <UISelect<StatusOption, BrandStatus>
              mode="single"
              label="Status"
              required
              options={BRAND_STATUS_OPTIONS}
              getOptionLabel={(opt) => opt.label}
              getOptionValue={(opt) => opt.value}
              value={field.value}
              onValueChange={field.onChange}
              error={errors.status?.message}
              disabled={isPending || !isPermitted}
            />
          )}
        />
      </form>
    </UIModal>
  );
}
