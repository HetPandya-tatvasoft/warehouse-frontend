"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";

import type { IApiErrorResponse } from "@/types/api.types";
import { UIModal, UIInput, UISelect, UICheckbox, UIButton } from "@/components/common";
import { Page, Permission, usePermissions } from "@/permissions";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";
import {
  unitOfMeasureFormSchema,
  type UnitOfMeasureFormData,
} from "../schemas/units-of-measure.schema";
import {
  UOM_STATUS_OPTIONS,
  UnitOfMeasureStatus,
  type IUnitOfMeasure,
  type ICreateUnitOfMeasurePayload,
  type IUpdateUnitOfMeasurePayload,
  type StatusOption,
} from "../types/units-of-measure.types";
import {
  useCreateUnitOfMeasure,
  useUpdateUnitOfMeasure,
} from "../queries/units-of-measure.queries";

interface UnitOfMeasureFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: IUnitOfMeasure | null;
}

export function UnitOfMeasureFormModal({
  open,
  onOpenChange,
  unit,
}: UnitOfMeasureFormModalProps) {
  const isEditing = Boolean(unit);
  const { can } = usePermissions();

  const isPermitted =
    can(Page.UnitsOfMeasure, Permission.VIEW) &&
    can(Page.UnitsOfMeasure, isEditing ? Permission.UPDATE : Permission.CREATE);

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<UnitOfMeasureFormData>({
    resolver: zodResolver(unitOfMeasureFormSchema),
    defaultValues: {
      name: "",
      code: "",
      allowsFractionalQuantity: false,
      status: UnitOfMeasureStatus.ACTIVE,
    },
  });

  const { mutate: createUnit, isPending: isCreating } = useCreateUnitOfMeasure();
  const { mutate: updateUnit, isPending: isUpdating } = useUpdateUnitOfMeasure();

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      reset({
        name: unit?.name ?? "",
        code: unit?.code ?? "",
        allowsFractionalQuantity: unit?.allowsFractionalQuantity ?? false,
        status: unit?.status ?? UnitOfMeasureStatus.ACTIVE,
      });
    }
  }, [open, unit, reset]);

  const onSubmit = (data: UnitOfMeasureFormData) => {
    if (isPending || !isPermitted) return;

    const options = {
      onSuccess: (res: { message?: string }) => {
        toast.success(
          res?.message ||
            (isEditing
              ? MESSAGES.PRODUCT_UNITS_OF_MEASURE.UPDATE_SUCCESS
              : MESSAGES.PRODUCT_UNITS_OF_MEASURE.CREATE_SUCCESS),
        );
        onOpenChange(false);
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError<IApiErrorResponse>(error)) {
          toast.error(
            error.response?.data?.message || MESSAGES.COMMON.UNEXPECTED_ERROR,
          );
        } else {
          toast.error(MESSAGES.COMMON.UNEXPECTED_ERROR);
        }
      },
    };

    if (unit?.id) {
      const trimmedName = data.name.trim();
      const trimmedCode = data.code.trim();
      const patchPayload: IUpdateUnitOfMeasurePayload = {};

      if (trimmedName !== unit.name) {
        patchPayload.name = trimmedName;
      }
      if (trimmedCode !== unit.code) {
        patchPayload.code = trimmedCode;
      }
      if (data.allowsFractionalQuantity !== unit.allowsFractionalQuantity) {
        patchPayload.allowsFractionalQuantity = data.allowsFractionalQuantity;
      }
      if (data.status !== unit.status) {
        patchPayload.status = data.status;
      }

      if (Object.keys(patchPayload).length === 0) {
        toast.info("No changes were made.");
        onOpenChange(false);
        return;
      }

      updateUnit({ id: unit.id, payload: patchPayload }, options);
    } else {
      const createPayload: ICreateUnitOfMeasurePayload = {
        name: data.name.trim(),
        code: data.code.trim(),
        allowsFractionalQuantity: Boolean(data.allowsFractionalQuantity),
        status: data.status,
      };
      createUnit(createPayload, options);
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
          ? TITLES.PRODUCT_UNITS_OF_MEASURE.EDIT_UOM
          : TITLES.PRODUCT_UNITS_OF_MEASURE.CREATE_NEW_UOM
      }
      description={
        isEditing
          ? MESSAGES.PRODUCT_UNITS_OF_MEASURE.MODAL_EDIT_DESCRIPTION
          : MESSAGES.PRODUCT_UNITS_OF_MEASURE.MODAL_CREATE_DESCRIPTION
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
            form="uom-form"
            loading={isPending}
            disabled={!isPermitted}
          >
            {isEditing ? "Save Changes" : "Create Unit of Measure"}
          </UIButton>
        </div>
      }
    >
      <form
        id="uom-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 py-2"
      >
        <UIInput
          label="Unit Name"
          required
          error={errors.name?.message}
          disabled={isPending || !isPermitted}
          placeholder="e.g. Kilogram, Meter, Piece"
          {...register("name")}
        />

        <UIInput
          label="Unit Code"
          required
          error={errors.code?.message}
          disabled={isPending || !isPermitted}
          placeholder="e.g. kg, m, pcs"
          {...register("code")}
        />

        <Controller
          control={control}
          name="allowsFractionalQuantity"
          render={({ field }) => (
            <UICheckbox
              id="uom-allows-fractional"
              label="Allow fractional quantities"
              description="Allow decimal quantities, such as 1.5 kg."
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(Boolean(checked))}
              error={errors.allowsFractionalQuantity?.message}
              disabled={isPending || !isPermitted}
            />
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <UISelect<StatusOption, UnitOfMeasureStatus>
              mode="single"
              label="Status"
              required
              options={UOM_STATUS_OPTIONS}
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
