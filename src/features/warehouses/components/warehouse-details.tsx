"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, Edit, Pencil, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { UIInput } from "@/components/common/UIInput/UIInput";
import { UISelect } from "@/components/common/UISelect/UISelect";
import { UICheckbox } from "@/components/common/UICheckbox";
import { UIButton } from "@/components/common/UIButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { Badge } from "@/components/ui/badge";

import {
  generalInfoSchema,
  addressSchema,
  contactsFormSchema,
} from "../schemas/warehouses.schema";
import type {
  GeneralInfoFormData,
  AddressFormData,
  ContactsFormData,
} from "../schemas/warehouses.schema";
import {
  useUpdateWarehouseGeneral,
  useUpdateWarehouseAddress,
  useUpdateWarehouseContacts,
} from "../queries/warehouses.queries";
import {
  WarehouseStatus,
  type IWarehouse,
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
import { FullNameCombobox } from "./full-name-combobox";
import { AddWarehouseButton } from "./add-warehouse-button";
import { useUnsavedChangesGuard } from "@/shared/hooks/use-unsaved-changes-guard";
import { useWarehouseContactsState } from "../hooks/use-warehouse-contacts-state";

interface WarehouseDetailsProps {
  warehouse: IWarehouse;
}

export function WarehouseDetails({ warehouse }: WarehouseDetailsProps) {
  const router = useRouter();
  // Edit states for sections
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isManagingContacts, setIsManagingContacts] = useState(false);

  // Selected contact index for contact management UI
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
  const [selectedIndexToRemove, setSelectedIndexToRemove] =
    useState<number>(-1);
  const [contactBeforeEdit, setContactBeforeEdit] = useState<{
    fullName: string;
    email: string;
    phone: string;
    userId: string | null;
    id: string | undefined;
  } | null>(null);

  // Fetch context for address prefill option
  const { data: currentUserData } = useCurrentUser();
  const activeBranch = currentUserData?.activeBranch;
  const { data: activeBranchDetails } = useBranch(activeBranch?.id || "", {
    enabled: Boolean(activeBranch?.id && isEditingAddress),
  });

  const { mutate: updateGeneral, isPending: isUpdatingGeneral } =
    useUpdateWarehouseGeneral();
  const { mutate: updateAddress, isPending: isUpdatingAddressState } =
    useUpdateWarehouseAddress();
  const { mutate: updateContacts, isPending: isUpdatingContacts } =
    useUpdateWarehouseContacts();

  const isPending =
    isUpdatingGeneral || isUpdatingAddressState || isUpdatingContacts;
  const { data: countriesData } = useCountries();
  // 1. General Info Form
  const {
    register: registerGeneral,
    handleSubmit: handleSubmitGeneral,
    control: controlGeneral,
    reset: resetGeneral,
    formState: { errors: errorsGeneral, isDirty: isDirtyGeneral },
  } = useForm<GeneralInfoFormData>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      name: warehouse.name,
      code: warehouse.code,
      status: warehouse.status,
      isDefault: warehouse.isDefault,
    },
  });

  // 2. Address Form
  const {
    register: registerAddress,
    handleSubmit: handleSubmitAddress,
    control: controlAddress,
    setValue: setValueAddress,
    reset: resetAddress,
    formState: { errors: errorsAddress, isDirty: isDirtyAddress },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addressLine1: warehouse.address?.addressLine1 || "",
      addressLine2: warehouse.address?.addressLine2 || "",
      countryId: warehouse.address?.countryId ?? undefined,
      stateId: warehouse.address?.stateId ?? undefined,
      cityId: warehouse.address?.cityId ?? undefined,
      postalCode: warehouse.address?.postalCode || "",
    },
  });

  const selectedCountryId = useWatch({
    control: controlAddress,
    name: "countryId",
  });
  const selectedStateId = useWatch({
    control: controlAddress,
    name: "stateId",
  });

  const { data: statesDataEdit, isLoading: isStatesLoading } = useStates(
    selectedCountryId || undefined,
  );
  const { data: citiesDataEdit, isLoading: isCitiesLoading } = useCities(
    selectedStateId || undefined,
  );

  const stateOptions = selectedCountryId ? statesDataEdit || [] : [];
  const cityOptions = selectedStateId ? citiesDataEdit || [] : [];

  const handlePrefillAddress = () => {
    if (activeBranchDetails?.address) {
      setValueAddress(
        "addressLine1",
        activeBranchDetails.address.addressLine1 || "",
      );
      setValueAddress(
        "addressLine2",
        activeBranchDetails.address.addressLine2 || "",
      );
      setValueAddress("countryId", activeBranchDetails.address.countryId);
      setValueAddress("stateId", activeBranchDetails.address.stateId);
      setValueAddress("cityId", activeBranchDetails.address.cityId);
      setValueAddress(
        "postalCode",
        activeBranchDetails.address.postalCode || "",
      );
      toast.success("Address prefilled from active branch.");
    } else {
      toast.error("Active branch address details not available.");
    }
  };

  // 3. Contacts Form
  const {
    register: registerContacts,
    handleSubmit: handleSubmitContacts,
    control: controlContacts,
    setValue: setValueContacts,
    reset: resetContacts,
    trigger: triggerContacts,
    getValues: getValuesContacts,
    formState: { errors: errorsContacts, isDirty: isDirtyContacts },
  } = useForm<ContactsFormData>({
    resolver: zodResolver(contactsFormSchema),
    defaultValues: {
      contacts: (warehouse.contacts || []).map((c) => ({
        id: c.id,
        userId: c.userId || null,
        fullName: c.fullName,
        email: c.email || "",
        phone: c.phone,
        isDefault: c.isDefault,
      })),
    },
  });

  const isDirty = isDirtyGeneral || isDirtyAddress || isDirtyContacts;
  const {
    isOpen: isGuardOpen,
    confirmAction,
    confirm: onConfirmDiscard,
    cancel: onCancelDiscard,
  } = useUnsavedChangesGuard(isDirty);

  const { fields, append, remove, update } = useFieldArray({
    control: controlContacts,
    name: "contacts",
  });

  const contactsList = useWatch({ control: controlContacts, name: "contacts" });

  const {
    selectedContactId,
    setSelectedContactId,
    selectedIndex,
    isEditingName,
    setIsEditingName,
    contactsListWithFallback,
    isCurrentContactIncomplete,
  } = useWarehouseContactsState({
    fields,
    contactsList,
    isManagingContacts,
  });

  // Capture initial contact state backup during render when selected tab changes or editing toggles
  const [prevSyncKey, setPrevSyncKey] = useState<{
    selectedContactId: string;
    selectedIndex: number;
    isManagingContacts: boolean;
  } | null>(null);

  if (
    !prevSyncKey ||
    selectedContactId !== prevSyncKey.selectedContactId ||
    selectedIndex !== prevSyncKey.selectedIndex ||
    isManagingContacts !== prevSyncKey.isManagingContacts
  ) {
    setPrevSyncKey({ selectedContactId, selectedIndex, isManagingContacts });
    const current = getValuesContacts(`contacts.${selectedIndex}`);
    setContactBeforeEdit(
      current
        ? {
            fullName: current.fullName || "",
            email: current.email || "",
            phone: current.phone || "",
            userId: current.userId || null,
            id: current.id,
          }
        : null
    );
  }

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

  // Reset forms on warehouse prop updates only if not currently editing that section
  useEffect(() => {
    if (!isEditingGeneral) {
      resetGeneral({
        name: warehouse.name,
        code: warehouse.code,
        status: warehouse.status,
        isDefault: warehouse.isDefault,
      });
    }
    if (!isEditingAddress) {
      resetAddress({
        addressLine1: warehouse.address?.addressLine1 || "",
        addressLine2: warehouse.address?.addressLine2 || "",
        countryId: warehouse.address?.countryId ?? undefined,
        stateId: warehouse.address?.stateId ?? undefined,
        cityId: warehouse.address?.cityId ?? undefined,
        postalCode: warehouse.address?.postalCode || "",
      });
    }
    if (!isManagingContacts) {
      resetContacts({
        contacts: (warehouse.contacts || []).map((c) => ({
          id: c.id,
          userId: c.userId || null,
          fullName: c.fullName,
          email: c.email || "",
          phone: c.phone,
          isDefault: c.isDefault,
        })),
      });
    }
  }, [
    warehouse,
    resetGeneral,
    resetAddress,
    resetContacts,
    isEditingGeneral,
    isEditingAddress,
    isManagingContacts,
  ]);

  // Handle section Saves
  const handleSaveGeneral = (data: GeneralInfoFormData) => {
    const payload = {
      name: data.name.trim(),
      code: data.code.trim(),
      status: data.status,
      isDefault: data.isDefault,
    };

    updateGeneral(
      { id: warehouse.id, payload },
      {
        onSuccess: () => {
          toast.success("General information updated successfully.");
          setIsEditingGeneral(false);
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            toast.error(
              error.response?.data?.message || "Failed to update general info.",
            );
          } else {
            toast.error("Something went wrong.");
          }
        },
      },
    );
  };

  const handleSaveAddress = (data: AddressFormData) => {
    const payload = {
      addressLine1: data.addressLine1.trim(),
      addressLine2: data.addressLine2?.trim() || undefined,
      countryId: data.countryId,
      stateId: data.stateId,
      cityId: data.cityId,
      postalCode: data.postalCode.trim(),
    };

    updateAddress(
      { id: warehouse.id, payload },
      {
        onSuccess: () => {
          toast.success("Address location details updated.");
          setIsEditingAddress(false);
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            toast.error(
              error.response?.data?.message || "Failed to update address.",
            );
          } else {
            toast.error("Something went wrong.");
          }
        },
      },
    );
  };

  const handleSaveContacts = (data: ContactsFormData) => {
    const payload = {
      contacts: data.contacts.map((c) => ({
        id: c.id,
        userId: c.userId || null,
        fullName: c.fullName.trim(),
        email: c.email.trim(),
        phone: c.phone.trim(),
        isDefault: c.isDefault,
      })),
    };

    updateContacts(
      { id: warehouse.id, payload },
      {
        onSuccess: () => {
          toast.success("Contacts list updated successfully.");
          setIsManagingContacts(false);
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            toast.error(
              error.response?.data?.message || "Failed to update contacts.",
            );
          } else {
            toast.error("Something went wrong.");
          }
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => confirmAction(() => router.push("/warehouses"))}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 px-2.5 py-1 rounded-lg transition-all duration-200 shadow-2xs w-fit"
        >
          <ArrowLeft className="size-3.5 stroke-[2.5]" />
          Back to Warehouses
        </button>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-1">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              {warehouse.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span className="font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                {warehouse.code}
              </span>
              <span>•</span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  warehouse.status === WarehouseStatus.ACTIVE
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800"
                }`}
              >
                {warehouse.status}
              </span>
              {warehouse.isDefault && (
                <>
                  <span>•</span>
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/80 border text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full select-none shrink-0">
                    Primary Warehouse
                  </Badge>
                </>
              )}
              {warehouse.branch?.name && (
                <>
                  <span>•</span>
                  <span>📍 {warehouse.branch.name}</span>
                </>
              )}
            </div>
          </div>
          <AddWarehouseButton className="h-9" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6">
        {/* Card 1: General Info */}
        <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2 mb-3">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              General Information
            </h3>
            {!isEditingGeneral && (
              <UIButton
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  confirmAction(() => {
                    resetAddress();
                    setIsEditingAddress(false);
                    resetContacts();
                    setIsManagingContacts(false);
                    setIsEditingGeneral(true);
                  });
                }}
                disabled={isPending}
                className="size-8"
                aria-label="Edit general information"
              >
                <Edit className="size-3.5" />
              </UIButton>
            )}
          </div>

          <form
            onSubmit={handleSubmitGeneral(handleSaveGeneral)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UIInput
                label="Warehouse Name"
                required
                error={errorsGeneral.name?.message}
                disabled={isPending || !isEditingGeneral}
                {...registerGeneral("name")}
              />

              <UIInput
                label="Warehouse Code"
                required
                error={errorsGeneral.code?.message}
                disabled={isPending || !isEditingGeneral}
                {...registerGeneral("code")}
              />

              <Controller
                control={controlGeneral}
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
                    error={errorsGeneral.status?.message}
                    disabled={isPending || !isEditingGeneral}
                  />
                )}
              />

              <UIInput
                label="Belongs to Branch"
                value={warehouse.branch?.name || "N/A"}
                disabled={true}
                readOnly
              />

              <div className="flex items-center pt-8">
                <Controller
                  control={controlGeneral}
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
                      disabled={isPending || !isEditingGeneral}
                      error={errorsGeneral.isDefault?.message}
                    />
                  )}
                />
              </div>
            </div>

            {isEditingGeneral && (
              <div className="flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
                <UIButton
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => {
                    confirmAction(() => {
                      resetGeneral();
                      setIsEditingGeneral(false);
                    });
                  }}
                >
                  Cancel
                </UIButton>
                <UIButton type="submit" size="sm" loading={isPending}>
                  Save Changes
                </UIButton>
              </div>
            )}
          </form>
        </div>

        {/* Card 2: Address */}
        <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2 mb-3">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Address Location
            </h3>
            {!isEditingAddress && (
              <UIButton
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  confirmAction(() => {
                    resetGeneral();
                    setIsEditingGeneral(false);
                    resetContacts();
                    setIsManagingContacts(false);
                    setIsEditingAddress(true);
                  });
                }}
                disabled={isPending}
                className="size-8"
                aria-label="Edit address"
              >
                <Edit className="size-3.5" />
              </UIButton>
            )}
          </div>

          <form
            onSubmit={handleSubmitAddress(handleSaveAddress)}
            className="space-y-4"
          >
            {isEditingAddress && activeBranchDetails?.address && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handlePrefillAddress}
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  Use Branch Address
                </button>
              </div>
            )}

            <UIInput
              label="Address Line 1"
              required
              error={errorsAddress.addressLine1?.message}
              disabled={isPending || !isEditingAddress}
              {...registerAddress("addressLine1")}
            />

            <UIInput
              label="Address Line 2"
              error={errorsAddress.addressLine2?.message}
              disabled={isPending || !isEditingAddress}
              {...registerAddress("addressLine2")}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                control={controlAddress}
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
                      setValueAddress(
                        "stateId",
                        undefined as unknown as number,
                      );
                      setValueAddress("cityId", undefined as unknown as number);
                    }}
                    error={errorsAddress.countryId?.message}
                    disabled={isPending || !isEditingAddress}
                    searchable
                  />
                )}
              />

              <Controller
                control={controlAddress}
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
                      setValueAddress("cityId", undefined as unknown as number);
                    }}
                    error={errorsAddress.stateId?.message}
                    disabled={
                      isPending || !isEditingAddress || !selectedCountryId
                    }
                    isLoading={isStatesLoading}
                    searchable
                  />
                )}
              />

              <Controller
                control={controlAddress}
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
                    error={errorsAddress.cityId?.message}
                    disabled={
                      isPending || !isEditingAddress || !selectedStateId
                    }
                    isLoading={isCitiesLoading}
                    searchable
                  />
                )}
              />

              <UIInput
                label="Postal Code"
                required
                error={errorsAddress.postalCode?.message}
                disabled={isPending || !isEditingAddress}
                {...registerAddress("postalCode")}
              />
            </div>

            {isEditingAddress && (
              <div className="flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
                <UIButton
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => {
                    confirmAction(() => {
                      resetAddress();
                      setIsEditingAddress(false);
                    });
                  }}
                >
                  Cancel
                </UIButton>
                <UIButton type="submit" size="sm" loading={isPending}>
                  Save Changes
                </UIButton>
              </div>
            )}
          </form>
        </div>

        {/* Card 3: Contacts */}
        <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2 mb-3">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
              Contact Information
            </h3>
            {!isManagingContacts && (
              <UIButton
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  confirmAction(() => {
                    resetGeneral();
                    setIsEditingGeneral(false);
                    resetAddress();
                    setIsEditingAddress(false);
                    setIsManagingContacts(true);
                  });
                }}
                disabled={isPending}
                className="size-8"
                aria-label="Edit contact persons"
              >
                <Edit className="size-3.5" />
              </UIButton>
            )}
          </div>

          {errorsContacts.contacts?.message && (
            <div className="text-xs font-semibold text-destructive p-3 bg-destructive/10 rounded-lg border border-destructive/20 mb-4">
              {errorsContacts.contacts.message}
            </div>
          )}

          <form
            onSubmit={handleSubmitContacts(handleSaveContacts)}
            className="space-y-4"
          >
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
                      triggerContacts(`contacts.${selectedIndex}`);
                      setSelectedContactId(val);
                    }
                  }}
                  disabled={isPending}
                />
              </div>

              {isManagingContacts && (
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
              )}

              {isManagingContacts && (
                <UIButton
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const currentContact =
                      contactsListWithFallback[selectedIndex];
                    const isNewContact = !currentContact?.id;

                    if (isNewContact) {
                      const idxToRemove = selectedIndex;
                      const nextIndex =
                        idxToRemove === fields.length - 1
                          ? idxToRemove - 1
                          : idxToRemove + 1;
                      const nextId = fields[nextIndex]?.id || "";
                      setSelectedContactId(nextId);
                      remove(idxToRemove);
                    } else {
                      if (contactBeforeEdit) {
                        update(selectedIndex, {
                          ...contactBeforeEdit,
                          isDefault: currentContact?.isDefault || false,
                        });
                        setIsEditingName(
                          contactBeforeEdit.fullName.trim() === "",
                        );
                      }
                    }
                  }}
                  disabled={isPending}
                  className="size-9 shrink-0 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-md"
                  aria-label="Remove or revert changes"
                  title="Remove or revert changes"
                >
                  <X className="size-4 text-destructive" />
                </UIButton>
              )}

              {isManagingContacts && fields.length > 1 && (
                <UIButton
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedIndexToRemove(selectedIndex);
                    setIsConfirmRemoveOpen(true);
                  }}
                  disabled={isPending}
                  className="size-9 shrink-0 text-destructive hover:bg-destructive/10 border border-zinc-200 dark:border-zinc-800 rounded-md"
                  aria-label="Remove contact"
                >
                  <Trash2 className="size-4" />
                </UIButton>
              )}
            </div>

            {/* Selected Contact Form Fields */}
            {selectedIndex !== -1 && fields[selectedIndex] && (
              <div
                key={fields[selectedIndex].id}
                className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/10 dark:bg-zinc-950/10 flex flex-col gap-4 shadow-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    {isManagingContacts ? (
                      isEditingName ? (
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <UIInput
                              label="Full Name"
                              required
                              disabled={isPending}
                              error={
                                errorsContacts.contacts?.[selectedIndex]
                                  ?.fullName?.message
                              }
                              {...registerContacts(
                                `contacts.${selectedIndex}.fullName` as const,
                              )}
                            />
                          </div>
                          <UIButton
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              triggerContacts(
                                `contacts.${selectedIndex}.fullName`,
                              ).then((isValid) => {
                                if (isValid) setIsEditingName(false);
                              });
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
                              control={controlContacts}
                              name={
                                `contacts.${selectedIndex}.fullName` as const
                              }
                              render={({ field: nameField }) => (
                                <FullNameCombobox
                                  value={nameField.value}
                                  onSelectPerson={(person) => {
                                    const current = getValuesContacts(
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
                                      if (current) {
                                        setContactBeforeEdit({
                                          fullName: current.fullName || "",
                                          email: current.email || "",
                                          phone: current.phone || "",
                                          userId: current.userId || null,
                                          id: current.id,
                                        });
                                      }
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
                                    errorsContacts.contacts?.[selectedIndex]
                                      ?.fullName?.message
                                  }
                                />
                              )}
                            />
                          </div>
                          <UIButton
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const current = getValuesContacts(
                                `contacts.${selectedIndex}`,
                              );
                              setContactBeforeEdit({
                                fullName: current.fullName || "",
                                email: current.email || "",
                                phone: current.phone || "",
                                userId: current.userId || null,
                                id: current.id,
                              });
                              setIsEditingName(true);
                            }}
                            className="size-9 shrink-0 border border-zinc-200 dark:border-zinc-800 rounded-md"
                            aria-label="Edit name"
                          >
                            <Pencil className="size-4 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100" />
                          </UIButton>
                        </div>
                      )
                    ) : (
                      <Controller
                        control={controlContacts}
                        name={`contacts.${selectedIndex}.fullName` as const}
                        render={({ field: nameField }) => (
                          <FullNameCombobox
                            value={nameField.value}
                            onSelectPerson={() => {}}
                            disabled={true}
                            error={
                              errorsContacts.contacts?.[selectedIndex]?.fullName
                                ?.message
                            }
                          />
                        )}
                      />
                    )}
                  </div>

                  <UIInput
                    label="Phone"
                    required
                    error={
                      errorsContacts.contacts?.[selectedIndex]?.phone?.message
                    }
                    disabled={isPending || !isManagingContacts}
                    {...registerContacts(
                      `contacts.${selectedIndex}.phone` as const,
                    )}
                  />

                  <UIInput
                    label="Email"
                    required
                    error={
                      errorsContacts.contacts?.[selectedIndex]?.email?.message
                    }
                    disabled={isPending || !isManagingContacts}
                    {...registerContacts(
                      `contacts.${selectedIndex}.email` as const,
                    )}
                  />

                  <div className="flex items-center gap-2 pt-2 sm:col-span-2">
                    <label
                      className={`flex items-center gap-3 select-none ${isManagingContacts ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <input
                        type="radio"
                        name="isDefaultContact"
                        checked={
                          contactsListWithFallback[selectedIndex]?.isDefault ||
                          false
                        }
                        onChange={() => {
                          if (!isManagingContacts) return;
                          fields.forEach((_, idx) => {
                            setValueContacts(
                              `contacts.${idx}.isDefault` as const,
                              idx === selectedIndex,
                            );
                          });
                        }}
                        disabled={isPending || !isManagingContacts}
                        className={`size-4 rounded-full border border-zinc-300 dark:border-zinc-800 text-zinc-900 accent-zinc-900 focus:ring-0 ${isManagingContacts ? "cursor-pointer" : "cursor-default"}`}
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

            {isManagingContacts && (
              <div className="flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
                <UIButton
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => {
                    confirmAction(() => {
                      resetContacts();
                      setIsManagingContacts(false);
                    });
                  }}
                >
                  Cancel
                </UIButton>
                <UIButton type="submit" size="sm" loading={isPending}>
                  Save Changes
                </UIButton>
              </div>
            )}
          </form>

          {/* Confirm Dialog for Contact Deletes */}
          <ConfirmDialog
            open={isConfirmRemoveOpen}
            onOpenChange={setIsConfirmRemoveOpen}
            title="Remove Contact"
            description="Are you sure you want to remove this contact from the warehouse? This action only affects this warehouse record and can be undone by canceling form changes."
            confirmText="Remove"
            confirmVariant="destructive"
            onConfirm={() => {
              if (fields.length <= 1) return;
              const wasDefault =
                contactsListWithFallback[selectedIndexToRemove]?.isDefault;
              remove(selectedIndexToRemove);
              setIsConfirmRemoveOpen(false);

              const nextIndex = Math.max(0, selectedIndexToRemove - 1);
              setTimeout(() => {
                setSelectedContactId(fields[nextIndex]?.id || fields[0]?.id);
                if (wasDefault) {
                  setValueContacts("contacts.0.isDefault", true);
                }
              }, 0);
            }}
            isLoading={isPending}
          />
        </div>
      </div>
      <ConfirmDialog
        open={isGuardOpen}
        onOpenChange={(open) => {
          if (!open) onCancelDiscard();
        }}
        title="Discard Unsaved Changes?"
        description="You have unsaved changes. Are you sure you want to discard your changes and leave this section?"
        confirmText="Discard Changes"
        confirmVariant="destructive"
        onConfirm={onConfirmDiscard}
      />
    </div>
  );
}
