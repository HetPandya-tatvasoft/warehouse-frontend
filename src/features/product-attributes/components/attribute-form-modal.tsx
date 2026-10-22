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
  attributeUpsertSchema,
  type AttributeUpsertFormData,
} from "../schemas/product-attributes.schema";
import {
  ATTRIBUTE_STATUS_OPTIONS,
  ProductAttributeStatus,
  type IProductAttribute,
  type StatusOption,
} from "../types/product-attributes.types";
import {
  useCreateAttribute,
  useUpdateAttribute,
} from "../queries/product-attributes.queries";

interface AttributeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute?: IProductAttribute | null;
}

export function AttributeFormModal({
  open,
  onOpenChange,
  attribute,
}: AttributeFormModalProps) {
  const isEditing = Boolean(attribute);
  const { can } = usePermissions();

  const isPermitted =
    can(Page.ProductAttributes, Permission.VIEW) &&
    can(
      Page.ProductAttributes,
      isEditing ? Permission.UPDATE : Permission.CREATE,
    );

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<AttributeUpsertFormData>({
    resolver: zodResolver(attributeUpsertSchema),
    defaultValues: {
      name: "",
      status: ProductAttributeStatus.ACTIVE,
    },
  });

  const { mutate: createAttribute, isPending: isCreating } =
    useCreateAttribute();
  const { mutate: updateAttribute, isPending: isUpdating } =
    useUpdateAttribute();

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      reset({
        name: attribute?.name ?? "",
        status: attribute?.status ?? ProductAttributeStatus.ACTIVE,
      });
    }
  }, [open, attribute, reset]);

  const onSubmit = (data: AttributeUpsertFormData) => {
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

    if (attribute?.id) {
      updateAttribute({ id: attribute.id, payload }, options);
    } else {
      createAttribute(payload, options);
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
          ? TITLES.PRODUCT_ATTRIBUTES.EDIT_ATTRIBUTE
          : TITLES.PRODUCT_ATTRIBUTES.CREATE_NEW_ATTRIBUTE
      }
      description={
        isEditing
          ? MESSAGES.PRODUCT_ATTRIBUTES.MODAL_EDIT_DESCRIPTION
          : MESSAGES.PRODUCT_ATTRIBUTES.MODAL_CREATE_DESCRIPTION
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
            form="attribute-form"
            loading={isPending}
            disabled={!isPermitted}
          >
            {isEditing ? "Save Changes" : "Create Attribute"}
          </UIButton>
        </div>
      }
    >
      <form
        id="attribute-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 py-2"
      >
        <UIInput
          label="Attribute Name"
          required
          error={errors.name?.message}
          disabled={isPending || !isPermitted}
          {...register("name")}
        />

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <UISelect<StatusOption, ProductAttributeStatus>
              mode="single"
              label="Status"
              required
              options={ATTRIBUTE_STATUS_OPTIONS}
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
