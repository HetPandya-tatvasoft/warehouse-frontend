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
  attributeValueUpsertSchema,
  type AttributeValueUpsertFormData,
} from "../schemas/product-attributes.schema";
import {
  ATTRIBUTE_STATUS_OPTIONS,
  ProductAttributeStatus,
  type IAttributeValue,
  type IProductAttribute,
  type StatusOption,
} from "../types/product-attributes.types";
import {
  useCreateAttributeValue,
  useUpdateAttributeValue,
} from "../queries/product-attributes.queries";

interface AttributeValueFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: IAttributeValue | null;
  parent: IProductAttribute;
}

export function AttributeValueFormModal({
  open,
  onOpenChange,
  value,
  parent,
}: AttributeValueFormModalProps) {
  const isEditing = Boolean(value);
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
  } = useForm<AttributeValueUpsertFormData>({
    resolver: zodResolver(attributeValueUpsertSchema),
    defaultValues: {
      label: "",
      status: ProductAttributeStatus.ACTIVE,
    },
  });

  const { mutate: createAttributeValue, isPending: isCreating } =
    useCreateAttributeValue();
  const { mutate: updateAttributeValue, isPending: isUpdating } =
    useUpdateAttributeValue();

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      reset({
        label: value?.label ?? "",
        status: value?.status ?? ProductAttributeStatus.ACTIVE,
      });
    }
  }, [open, value, reset, parent.id]);

  const onSubmit = (data: AttributeValueUpsertFormData) => {
    if (isPending || !isPermitted) return;

    const payload = {
      label: data.label.trim(),
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

    if (value?.id) {
      updateAttributeValue(
        { attributeId: parent.id, id: value.id, payload },
        options,
      );
    } else {
      createAttributeValue({ attributeId: parent.id, payload }, options);
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
          ? TITLES.PRODUCT_ATTRIBUTES.EDIT_VALUE
          : TITLES.PRODUCT_ATTRIBUTES.CREATE_NEW_VALUE
      }
      description={MESSAGES.PRODUCT_ATTRIBUTE_VALUES.MODAL_DESCRIPTION}
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
            form="attribute-value-form"
            loading={isPending}
            disabled={!isPermitted}
          >
            {isEditing ? "Save Changes" : "Create Value"}
          </UIButton>
        </div>
      }
    >
      <form
        id="attribute-value-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 py-2"
      >
        <UIInput label="Attribute" value={parent.name} disabled />

        <UIInput
          label="Value Label"
          required
          error={errors.label?.message}
          disabled={isPending || !isPermitted}
          {...register("label")}
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
