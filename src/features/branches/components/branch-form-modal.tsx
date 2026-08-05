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
import {
  BranchStatus,
  type IBranch,
  type ICreateBranchPayload,
  type IUpdateBranchPayload,
} from "../types/branches.types";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";
import {
  useCountries,
  useStates,
  useCities,
  type ICountry,
  type IState,
  type ICity,
} from "@/shared/hooks/use-regions";

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
      cityId: undefined,
      stateId: undefined,
      countryId: undefined,
      postalCode: "",
    },
  });

  const selectedCountryId = useWatch({ control, name: "countryId" });
  const selectedStateId = useWatch({ control, name: "stateId" });

  // Load locations dynamically from API
  const { data: countriesData, isLoading: isCountriesLoading } = useCountries();
  const { data: statesData, isLoading: isStatesLoading } = useStates(
    selectedCountryId || undefined,
  );
  const { data: citiesData, isLoading: isCitiesLoading } = useCities(
    selectedStateId || undefined,
  );

  const stateOptions = selectedCountryId ? statesData || [] : [];
  const cityOptions = selectedStateId ? citiesData || [] : [];

  const { mutate: createBranch, isPending: isCreating } = useCreateBranch();
  const { mutate: updateBranch, isPending: isUpdating } = useUpdateBranch();

  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      reset({
        name: branch?.name || "",
        status: branch?.status || BranchStatus.ACTIVE,
        addressLine1: branch?.address?.addressLine1 || "",
        addressLine2: branch?.address?.addressLine2 || "",
        cityId: branch?.address?.cityId ?? undefined,
        stateId: branch?.address?.stateId ?? undefined,
        countryId: branch?.address?.countryId ?? undefined,
        postalCode: branch?.address?.postalCode || "",
      });
    }
  }, [open, branch, reset]);

  const saveBranch = (
    payload: ICreateBranchPayload & IUpdateBranchPayload,
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
      cityId: formData.cityId || undefined,
      stateId: formData.stateId || undefined,
      countryId: formData.countryId || undefined,
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
                name="countryId"
                render={({ field }) => (
                  <UISelect<ICountry, number>
                    mode="single"
                    label="Country"
                    options={countriesData ?? []}
                    getOptionLabel={(c) => c.name}
                    getOptionValue={(c) => c.id}
                    value={field.value ?? undefined}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("stateId", undefined);
                      setValue("cityId", undefined);
                    }}
                    error={errors.countryId?.message}
                    disabled={isPending}
                    isLoading={isCountriesLoading}
                    searchable
                  />
                )}
              />

              <Controller
                control={control}
                name="stateId"
                render={({ field }) => (
                  <UISelect<IState, number>
                    mode="single"
                    label="State"
                    options={stateOptions}
                    getOptionLabel={(s) => s.name}
                    getOptionValue={(s) => s.id}
                    value={field.value ?? undefined}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("cityId", undefined);
                    }}
                    error={errors.stateId?.message}
                    disabled={isPending || !selectedCountryId}
                    isLoading={isStatesLoading}
                    searchable
                  />
                )}
              />

              <Controller
                control={control}
                name="cityId"
                render={({ field }) => (
                  <UISelect<ICity, number>
                    mode="single"
                    label="City"
                    options={cityOptions}
                    getOptionLabel={(c) => c.name}
                    getOptionValue={(c) => c.id}
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    error={errors.cityId?.message}
                    disabled={isPending || !selectedStateId}
                    isLoading={isCitiesLoading}
                    searchable
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
