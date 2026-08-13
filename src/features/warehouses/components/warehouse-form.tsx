"use client";

import { useMemo, useState } from "react";
import { useForm, Controller, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Pencil, Check, X } from "lucide-react";

import { UIInput } from "@/components/common/UIInput/UIInput";
import { UISelect } from "@/components/common/UISelect/UISelect";
import { UICheckbox } from "@/components/common/UICheckbox";
import { UIButton } from "@/components/common/UIButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/components/ui/badge";

import {
  warehouseUpsertSchema,
  type WarehouseUpsertFormData,
} from "../schemas/warehouses.schema";
import { useCreateWarehouse } from "../queries/warehouses.queries";
import {
  WarehouseStatus,
  type IUpsertWarehousePayload,
  WAREHOUSE_STATUS_OPTIONS as statusOptions,
  type IStatusOption as StatusOption,
} from "../types/warehouses.types";
import { useCurrentUser } from "@/features/auth/queries/auth.queries";
import { useBranch } from "@/features/branches/queries/branches.queries";
import {
  useCountries,
  useStates,
  useCities,
  type ICountry,
  type IState,
  type ICity,
} from "@/shared/hooks/use-regions";
import { MESSAGES } from "@/shared/constants/messages";
import { FullNameCombobox } from "./full-name-combobox";
import { useUnsavedChangesGuard } from "@/shared/hooks/use-unsaved-changes-guard";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import { useWarehouseContactsState } from "../hooks/use-warehouse-contacts-state";

export function WarehouseForm() {
  const router = useRouter();

  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);

  // Instead make somthing common like that, like this only calls a function or hook or like that and we directly get the data
  const { data: currentUserData } = useCurrentUser();
  const activeBranch = currentUserData?.activeBranch;

  const { data: activeBranchDetails } = useBranch(activeBranch?.id || "", {
    enabled: Boolean(activeBranch?.id),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    getValues,
    formState: { errors, isDirty },
  } = useForm<WarehouseUpsertFormData>({
    resolver: zodResolver(warehouseUpsertSchema),
    defaultValues: {
      name: "",
      code: "",
      status: WarehouseStatus.ACTIVE,
      isDefault: false,
      addressLine1: "",
      addressLine2: "",
      countryId: undefined,
      stateId: undefined,
      cityId: undefined,
      postalCode: "",
      contacts: [
        {
          fullName: "",
          phone: "",
          email: "",
          userId: null,
          isDefault: true,
        },
      ],
    },
  });

  // Unsaved changes guard configuration
  const {
    isOpen: isGuardOpen,
    confirmAction,
    confirm: onConfirmDiscard,
    cancel: onCancelDiscard,
  } = useUnsavedChangesGuard(isDirty);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "contacts",
  });

  const selectedCountryId = useWatch({ control, name: "countryId" });
  const selectedStateId = useWatch({ control, name: "stateId" });
  const contactsList = useWatch({ control, name: "contacts" });

  const {
    selectedContactId,
    setSelectedContactId,
    selectedIndex,
    isEditingName,
    setIsEditingName,
    contactsListWithFallback,
    isCurrentContactIncomplete,
  } = useWarehouseContactsState({ fields, contactsList });

  const { data: countriesData, isLoading: isCountriesLoading } = useCountries();
  const { data: statesData, isLoading: isStatesLoading } = useStates(
    selectedCountryId || undefined,
  );
  const { data: citiesData, isLoading: isCitiesLoading } = useCities(
    selectedStateId || undefined,
  );

  const stateOptions = selectedCountryId ? statesData || [] : [];
  const cityOptions = selectedStateId ? citiesData || [] : [];

  const { mutate: createWarehouse, isPending: isCreating } =
    useCreateWarehouse();

  const isPending = isCreating;

  const handlePrefillAddress = () => {
    if (activeBranchDetails?.address) {
      setValue("addressLine1", activeBranchDetails.address.addressLine1 || "");
      setValue("addressLine2", activeBranchDetails.address.addressLine2 || "");
      setValue("countryId", activeBranchDetails.address.countryId);
      setValue("stateId", activeBranchDetails.address.stateId);
      setValue("cityId", activeBranchDetails.address.cityId);
      setValue("postalCode", activeBranchDetails.address.postalCode || "");
      toast.success("Address prefilled from active branch.");
    } else {
      toast.error("Active branch address details not available.");
    }
  };

  // Contacts list options mapping for UISelect dropdown
  const contactSelectOptions = useMemo(() => {
    return fields.map((field, idx) => {
      const c = contactsListWithFallback[idx];
      return {
        id: field.id,
        fullName: c?.fullName?.trim() || "Untitled Contact",
        isDefault: c?.isDefault || false,
      };
    });
  }, [fields, contactsListWithFallback]);

  const onSubmit = (formData: WarehouseUpsertFormData) => {
    const contacts = formData.contacts || [];
    if (contacts.length === 0) {
      toast.error("At least one contact is required.");
      return;
    }

    // Validation: Exactly one default contact
    const defaultContactsCount = contacts.filter((c) => c.isDefault).length;
    if (defaultContactsCount !== 1) {
      toast.error("Exactly one contact must be set as default.");
      return;
    }

    const payload: IUpsertWarehousePayload = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      status: formData.status,
      isDefault: formData.isDefault,
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2?.trim() || undefined,
      countryId: formData.countryId,
      stateId: formData.stateId,
      cityId: formData.cityId,
      postalCode: formData.postalCode.trim(),
      contacts: contacts.map((c) => ({
        id: c.id,
        userId: c.userId || null,
        fullName: c.fullName.trim(),
        email: c.email.trim(),
        phone: c.phone.trim(),
        isDefault: c.isDefault,
      })),
    };

    createWarehouse(payload, {
      onSuccess: () => {
        toast.success(MESSAGES.WAREHOUSES.CREATE_SUCCESS);
        router.push(PAGE_ROUTES.WAREHOUSES);
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || MESSAGES.WAREHOUSES.CREATE_FAILED,
          );
        } else {
          toast.error(MESSAGES.COMMON.SOMETHING_WENT_WRONG);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() =>
            confirmAction(() => router.push(PAGE_ROUTES.WAREHOUSES))
          }
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 px-2.5 py-1 rounded-lg transition-all duration-200 shadow-2xs w-fit"
        >
          <ArrowLeft className="size-3.5 stroke-[2.5]" />
          Back to Warehouses
        </button>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
          Create New Warehouse
        </h2>
        <p className="text-xs text-muted-foreground">
          Define a new warehouse location and assign contact personnel.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 mt-6">
          {/* Card 1: General Information */}
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2 mb-3">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                General Information
              </h3>
            </div>

            <UIInput
              label="Warehouse Name"
              required
              error={errors.name?.message}
              disabled={isPending}
              {...register("name")}
            />

            <UIInput
              label="Warehouse Code"
              required
              error={errors.code?.message}
              disabled={isPending}
              {...register("code")}
            />

            {/* Active Branch Context Display */}
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col justify-center gap-1">
              <span className="text-[9px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase select-none">
                Warehouse will belong to
              </span>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-105 truncate">
                  📍 {activeBranch?.name || "Active Branch"}
                </span>
              </div>
            </div>

            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <UISelect<StatusOption, WarehouseStatus>
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

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-850">
              <Controller
                control={control}
                name="isDefault"
                render={({ field }) => (
                  <UICheckbox
                    label={
                      <span className="text-sm font-medium">
                        Default Warehouse
                      </span>
                    }
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                    error={errors.isDefault?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Card 2: Address Location */}
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2 mb-3">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                Address Location
              </h3>
              {activeBranchDetails?.address && (
                <button
                  type="button"
                  onClick={handlePrefillAddress}
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  Use Branch Address
                </button>
              )}
            </div>

            <UIInput
              label="Address Line 1"
              required
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
                    required
                    options={countriesData ?? []}
                    getOptionLabel={(c) => c.name}
                    getOptionValue={(c) => c.id}
                    value={field.value ?? undefined}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("stateId", undefined as unknown as number);
                      setValue("cityId", undefined as unknown as number);
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
                    required
                    options={stateOptions}
                    getOptionLabel={(s) => s.name}
                    getOptionValue={(s) => s.id}
                    value={field.value ?? undefined}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("cityId", undefined as unknown as number);
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
                    required
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
                required
                error={errors.postalCode?.message}
                disabled={isPending}
                {...register("postalCode")}
              />
            </div>
          </div>

          {/* Card 3: Contact Information */}
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-xs space-y-4">
            <div className="flex flex-col gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                Contact Information
              </h3>
            </div>

            {errors.contacts?.message && (
              <div className="text-sm font-medium text-destructive p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                {errors.contacts.message}
              </div>
            )}

            {/* Contact Dropdown Selector Row */}
            <div className="flex items-end gap-3 border-b border-zinc-150 dark:border-zinc-800 pb-4">
              <div className="flex-1">
                <UISelect
                  mode="single"
                  label="Select Contact"
                  placeholder="Choose a contact to edit..."
                  options={contactSelectOptions}
                  getOptionLabel={(opt) => opt.fullName}
                  getOptionValue={(opt) => opt.id}
                  getOptionBadge={(opt) => {
                    const badges = [];
                    if (opt.isDefault) {
                      badges.push(
                        <Badge
                          key="default"
                          className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/80 border text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full select-none shrink-0"
                        >
                          Primary
                        </Badge>,
                      );
                    }
                    return badges.length > 0 ? (
                      <div className="flex items-center gap-1.5">{badges}</div>
                    ) : undefined;
                  }}
                  value={selectedContactId}
                  onValueChange={(val) => {
                    if (val) {
                      trigger(`contacts.${selectedIndex}`).then((isValid) => {
                        if (isValid) {
                          setSelectedContactId(val);
                        } else {
                          toast.error(
                            "Please resolve the validation errors on the current contact before switching.",
                          );
                        }
                      });
                    }
                  }}
                  disabled={isPending}
                />
              </div>

              <UIButton
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Plus className="size-4" />}
                onClick={() => {
                  if (isCurrentContactIncomplete) {
                    toast.error(
                      "Please fill in the current contact's name, email, and phone number before adding another contact.",
                    );
                    return;
                  }

                  append({
                    fullName: "",
                    phone: "",
                    email: "",
                    userId: null,
                    isDefault: fields.length === 0,
                  });
                }}
                disabled={isPending || isCurrentContactIncomplete}
                className="h-9 shrink-0 font-medium"
              >
                Add Contact
              </UIButton>

              <UIButton
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (fields.length > 1) {
                    const idxToRemove = selectedIndex;
                    const nextIndex =
                      idxToRemove === fields.length - 1
                        ? idxToRemove - 1
                        : idxToRemove + 1;
                    const nextId = fields[nextIndex]?.id || "";
                    setSelectedContactId(nextId);
                    remove(idxToRemove);
                  } else {
                    setValue(`contacts.0.fullName`, "");
                    setValue(`contacts.0.email`, "");
                    setValue(`contacts.0.phone`, "");
                    setValue(`contacts.0.userId`, null);
                    setValue(`contacts.0.id`, undefined);
                    setIsEditingName(false);
                  }
                }}
                disabled={isPending}
                className="size-9 shrink-0 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-md"
                aria-label="Remove or reset this contact"
                title="Remove or reset this contact"
              >
                <X className="size-4 text-destructive" />
              </UIButton>

              {fields.length > 1 && (
                <UIButton
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsConfirmRemoveOpen(true)}
                  disabled={isPending}
                  className="size-9 shrink-0 text-destructive hover:bg-destructive/10 border border-zinc-200 dark:border-zinc-800 rounded-md"
                  aria-label="Remove contact"
                >
                  <Trash2 className="size-4" />
                </UIButton>
              )}
            </div>

            {/* Active Tab Panel (Direct RHF name binding) */}
            {selectedIndex !== -1 && fields[selectedIndex] && (
              <div
                key={fields[selectedIndex].id}
                className="p-5 border border-zinc-205 dark:border-zinc-800 rounded-xl bg-zinc-50/10 dark:bg-zinc-950/10 flex flex-col gap-4 shadow-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    {isEditingName ? (
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <UIInput
                            label="Full Name"
                            required
                            disabled={isPending}
                            error={
                              errors.contacts?.[selectedIndex]?.fullName
                                ?.message
                            }
                            {...register(
                              `contacts.${selectedIndex}.fullName` as const,
                            )}
                          />
                        </div>
                        <UIButton
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            trigger(`contacts.${selectedIndex}.fullName`).then(
                              (isValid) => {
                                if (isValid) setIsEditingName(false);
                              },
                            );
                          }}
                          className="size-9 shrink-0 border border-zinc-200 dark:border-zinc-800 rounded-md"
                          aria-label="Done editing name"
                        >
                          <Check className="size-4 text-emerald-600 dark:text-emerald-500" />
                        </UIButton>
                      </div>
                    ) : (
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Controller
                            control={control}
                            name={`contacts.${selectedIndex}.fullName` as const}
                            render={({ field: nameField }) => (
                              <FullNameCombobox
                                value={nameField.value}
                                onSelectPerson={(person) => {
                                  const current = getValues(
                                    `contacts.${selectedIndex}`,
                                  );
                                  if (person.type === "user") {
                                    update(selectedIndex, {
                                      fullName: person.fullName,
                                      email: person.email || "",
                                      phone: current?.phone || "",
                                      userId: person.id,
                                      id: current?.id,
                                      isDefault: current?.isDefault || false,
                                    });
                                  } else if (person.type === "contact") {
                                    update(selectedIndex, {
                                      fullName: person.fullName,
                                      email: person.email || "",
                                      phone: person.phone || "",
                                      userId: person.userId || null,
                                      id: person.id,
                                      isDefault: current?.isDefault || false,
                                    });
                                  } else if (person.type === "create") {
                                    update(selectedIndex, {
                                      fullName: person.fullName,
                                      email: "",
                                      phone: "",
                                      userId: null,
                                      id: undefined,
                                      isDefault: current?.isDefault || false,
                                    });
                                    setIsEditingName(true);
                                  }
                                }}
                                disabled={isPending}
                                error={
                                  errors.contacts?.[selectedIndex]?.fullName
                                    ?.message
                                }
                              />
                            )}
                          />
                        </div>
                        <UIButton
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsEditingName(true)}
                          className="size-9 shrink-0 border border-zinc-200 dark:border-zinc-800 rounded-md"
                          aria-label="Edit name"
                        >
                          <Pencil className="size-4 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100" />
                        </UIButton>
                      </div>
                    )}
                  </div>

                  <UIInput
                    label="Phone"
                    required
                    error={errors.contacts?.[selectedIndex]?.phone?.message}
                    disabled={isPending}
                    {...register(`contacts.${selectedIndex}.phone` as const)}
                  />

                  <UIInput
                    label="Email"
                    required
                    error={errors.contacts?.[selectedIndex]?.email?.message}
                    disabled={isPending}
                    {...register(`contacts.${selectedIndex}.email` as const)}
                  />

                  {/* Radio Button for Is Default Contact */}
                  <div className="flex items-center gap-2 pt-2 sm:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="isDefaultContact"
                        checked={
                          contactsListWithFallback[selectedIndex]?.isDefault ||
                          false
                        }
                        onChange={() => {
                          fields.forEach((_, idx) => {
                            setValue(
                              `contacts.${idx}.isDefault` as const,
                              idx === selectedIndex,
                            );
                          });
                        }}
                        disabled={isPending}
                        className="size-4 rounded-full border border-zinc-300 dark:border-zinc-800 text-zinc-900 accent-zinc-900 focus:ring-0 cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          Is Primary Default Contact
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight">
                          Make this person the primary point of contact for this
                          warehouse.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <UIButton
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              confirmAction(() => router.push(PAGE_ROUTES.WAREHOUSES))
            }
          >
            Cancel
          </UIButton>
          <UIButton type="submit" loading={isPending}>
            Create Warehouse
          </UIButton>
        </div>
      </form>

      {/* Confirmation Dialog for Contact Deletes */}
      <ConfirmDialog
        open={isConfirmRemoveOpen}
        onOpenChange={setIsConfirmRemoveOpen}
        title="Remove Contact"
        description="Are you sure you want to remove this contact from the warehouse? This action only affects this warehouse record and can be undone by canceling form changes."
        confirmText="Remove"
        confirmVariant="destructive"
        onConfirm={() => {
          if (fields.length <= 1) return;
          const wasDefault = contactsListWithFallback[selectedIndex]?.isDefault;
          remove(selectedIndex);
          setIsConfirmRemoveOpen(false);

          const nextIndex = Math.max(0, selectedIndex - 1);
          setTimeout(() => {
            setSelectedContactId(fields[nextIndex]?.id || fields[0]?.id);
            if (wasDefault) {
              setValue("contacts.0.isDefault", true);
            }
          }, 0);
        }}
        isLoading={isPending}
      />
      <ConfirmDialog
        open={isGuardOpen}
        onOpenChange={(open) => {
          if (!open) onCancelDiscard();
        }}
        title="Discard Unsaved Changes?"
        description="You have unsaved changes. Are you sure you want to discard your changes and leave this page?"
        confirmText="Discard Changes"
        confirmVariant="destructive"
        onConfirm={onConfirmDiscard}
      />
    </div>
  );
}
