"use client";

import { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";

import { UIModal } from "@/components/common/UIModal/UIModal";
import { UIInput } from "@/components/common/UIInput/UIInput";
import { UISelect } from "@/components/common/UISelect/UISelect";
import { UIButton } from "@/components/common/UIButton";

import {
  branchUpsertSchema,
  type BranchUpsertFormData,
} from "../schemas/branches.schema";
import { useCreateBranch, useUpdateBranch } from "../queries/branches.queries";
import { BranchStatus, type IBranch } from "../types/branches.types";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";
import { COUNTRY_STATES_MAP, STATE_CITIES_MAP } from "@/shared/constants/locations";

interface BranchFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: IBranch | null;
}

interface StatusOption {
  label: string;
  value: BranchStatus;
}

const statusOptions: StatusOption[] = [
  { label: "Active", value: BranchStatus.ACTIVE },
  { label: "Inactive", value: BranchStatus.INACTIVE },
];

export function BranchFormModal({
  open,
  onOpenChange,
  branch,
}: BranchFormModalProps) {
  const isEditing = Boolean(branch);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BranchUpsertFormData>({
    resolver: zodResolver(branchUpsertSchema),
    defaultValues: {
      name: "",
      status: BranchStatus.ACTIVE,
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  const selectedCountry = useWatch({ control, name: "country" });
  const selectedState = useWatch({ control, name: "state" });

  const countryOptions = Object.keys(COUNTRY_STATES_MAP);
  const stateOptions = selectedCountry
    ? COUNTRY_STATES_MAP[selectedCountry] || []
    : [];
  const cityOptions = selectedState
    ? STATE_CITIES_MAP[selectedState] || []
    : [];

  const { mutate: createBranch, isPending: isCreating } = useCreateBranch();
  const { mutate: updateBranch, isPending: isUpdating } = useUpdateBranch();

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      reset({
        name: branch?.name || "",
        status: branch?.status || BranchStatus.ACTIVE,
        addressLine1: branch?.addressLine1 || "",
        addressLine2: branch?.addressLine2 || "",
        city: branch?.city || "",
        state: branch?.state || "",
        country: branch?.country || "",
        postalCode: branch?.postalCode || "",
      });
    }
  }, [open, branch, reset]);

  const saveBranch = (
    payload: BranchUpsertFormData,
    options: {
      onSuccess: () => void;
      onError: (error: unknown) => void;
    },
  ) => {
    if (branch?.id) {
      updateBranch({ id: branch.id, payload }, options);
    } else {
      createBranch(payload, options);
    }
  };

  const onSubmit = (formData: BranchUpsertFormData) => {
    const payload = {
      name: formData.name.trim(),
      status: formData.status,
      addressLine1: formData.addressLine1?.trim() || undefined,
      addressLine2: formData.addressLine2?.trim() || undefined,
      city: formData.city?.trim() || undefined,
      state: formData.state?.trim() || undefined,
      country: formData.country?.trim() || undefined,
      postalCode: formData.postalCode?.trim() || undefined,
    };

    saveBranch(payload, {
      onSuccess: () => {
        toast.success(
          branch?.id
            ? MESSAGES.BRANCHES.UPDATE_SUCCESS
            : MESSAGES.BRANCHES.CREATE_SUCCESS,
        );
        onOpenChange(false);
        reset();
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message ||
              (branch?.id
                ? MESSAGES.BRANCHES.UPDATE_FAILED
                : MESSAGES.BRANCHES.CREATE_FAILED),
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
      title={
        isEditing
          ? TITLES.BRANCHES.EDIT_BRANCH
          : TITLES.BRANCHES.CREATE_NEW_BRANCH
      }
      description={
        isEditing
          ? "Update the details for this branch."
          : "Add a new branch to manage inventory locations."
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
            {isEditing ? "Save Changes" : "Create Branch"}
          </UIButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
        <UIInput
          label="Branch Name"
          required
          error={errors.name?.message}
          disabled={isPending}
          {...register("name")}
        />

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <UISelect<StatusOption, BranchStatus>
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

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Branch Address Info
          </h3>
          <div className="space-y-4">
            <UIInput
              label="Address Line 1"
              error={errors.addressLine1?.message}
              disabled={isPending}
              {...register("addressLine1")}
            />

            <UIInput
              label="Address Line 2"
              error={errors.addressLine2?.message}
              disabled={isPending}
              {...register("addressLine2")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <UISelect<string>
                    mode="single"
                    label="Country"
                    options={countryOptions}
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("state", "");
                      setValue("city", "");
                    }}
                    error={errors.country?.message}
                    disabled={isPending}
                  />
                )}
              />

              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <UISelect<string>
                    mode="single"
                    label="State"
                    options={stateOptions}
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("city", "");
                    }}
                    error={errors.state?.message}
                    disabled={isPending || !selectedCountry}
                  />
                )}
              />

              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <UISelect<string>
                    mode="single"
                    label="City"
                    options={cityOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    error={errors.city?.message}
                    disabled={isPending || !selectedState}
                  />
                )}
              />

              <UIInput
                label="Postal Code"
                error={errors.postalCode?.message}
                disabled={isPending}
                {...register("postalCode")}
              />
            </div>
          </div>
        </div>
      </form>
    </UIModal>
  );
}
