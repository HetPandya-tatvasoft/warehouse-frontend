"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { Building2, UserCircle, Loader2 } from "lucide-react";

import { UIInput } from "@/components/common/UIInput/UIInput";
import { UISelect } from "@/components/common/UISelect/UISelect";
import { UIButton } from "@/components/common/UIButton";
import { PageHeader, PageContainer } from "@/components/common";
import {
  tenantOnboardingSchema,
  type TenantOnboardingFormValues,
} from "../schemas/tenant.schema";
import { useOnboardTenant } from "../queries/tenants.queries";
import type { ITenantOnboardingDto } from "../types/tenants.types";
import { TenantSuccessDialog } from "./tenant-success-dialog";
import { PAGE_ROUTES } from "@/shared/constants/routes";
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

export function TenantCreateForm() {
  const router = useRouter();
  const { mutate: onboardTenant, isPending } = useOnboardTenant();

  const [successData, setSuccessData] = useState<{
    open: boolean;
    tenantName: string;
    adminEmail: string;
    temporaryPassword?: string;
  }>({
    open: false,
    tenantName: "",
    adminEmail: "",
    temporaryPassword: "",
  });

  const { register, handleSubmit, control, setValue, clearErrors, formState } =
    useForm<TenantOnboardingFormValues>({
      resolver: zodResolver(tenantOnboardingSchema),
      defaultValues: {
        companyName: "",
        slug: "",
        branchName: "Head Office",
        companyEmail: "",
        companyPhone: "",
        addressLine1: "",
        addressLine2: "",
        countryId: undefined,
        stateId: undefined,
        cityId: undefined,
        postalCode: "",
        primaryAdministrator: {
          firstName: "",
          lastName: "",
          email: "",
        },
      },
    });

  const { errors, touchedFields } = formState;

  // Watch country and state to filter choices dynamically
  const selectedCountryId = useWatch({ control, name: "countryId" });
  const selectedStateId = useWatch({ control, name: "stateId" });
  const companyNameValue = useWatch({ control, name: "companyName" });

  // Load locations dynamically from API
  const { data: countriesData, isLoading: isCountriesLoading } = useCountries();
  const { data: statesData, isLoading: isStatesLoading } =
    useStates(selectedCountryId);
  const { data: citiesData, isLoading: isCitiesLoading } =
    useCities(selectedStateId);

  // Auto-generate slug from Company Name
  useEffect(() => {
    if (!touchedFields.slug) {
      const generatedSlug = (companyNameValue || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphen
        .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens
      setValue("slug", generatedSlug, { shouldValidate: generatedSlug !== "" });
      if (generatedSlug === "") {
        clearErrors("slug");
      }
    }
  }, [companyNameValue, setValue, touchedFields.slug, clearErrors]);

  const stateOptions = selectedCountryId ? statesData || [] : [];
  const cityOptions = selectedStateId ? citiesData || [] : [];

  const onSubmit = (values: TenantOnboardingFormValues) => {
    const payload: ITenantOnboardingDto = {
      ...values,
      countryId: values.countryId!,
      stateId: values.stateId!,
      cityId: values.cityId!,
      addressLine2: values.addressLine2 || undefined,
      primaryAdministrator: {
        ...values.primaryAdministrator,
      },
    };

    onboardTenant(payload, {
      onSuccess: (response) => {
        setSuccessData({
          open: true,
          tenantName: response.data.tenantName,
          adminEmail: response.data.primaryAdministratorEmail,
          temporaryPassword: response.data.temporaryPassword,
        });
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          const responseData = error.response?.data;
          const message =
            responseData?.message ||
            responseData?.error ||
            MESSAGES.TENANTS.ONBOARD_FAILED;

          if (Array.isArray(message)) {
            message.forEach((msg) => toast.error(msg));
          } else {
            toast.error(message);
          }
        } else {
          toast.error(MESSAGES.COMMON.UNEXPECTED_ERROR);
        }
      },
    });
  };

  const handleCloseSuccessDialog = () => {
    setSuccessData((prev) => ({ ...prev, open: false }));
    router.push(PAGE_ROUTES.PLATFORM_TENANTS);
  };

  return (
    <PageContainer className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            {TITLES.TENANTS.ONBOARD_NEW_TENANT}
          </span>
        }
        description="Setup a new tenant organization and its primary administrator account."
      ></PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-zinc-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              1. Company Information
            </h2>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UIInput
                label="Company Name"
                required
                error={errors.companyName?.message}
                disabled={isPending}
                {...register("companyName")}
              />

              <UIInput
                label="Slug"
                required
                error={errors.slug?.message}
                disabled={isPending}
                {...register("slug")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UIInput
                label="Initial Branch Name"
                required
                error={errors.branchName?.message}
                disabled={isPending}
                {...register("branchName")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UIInput
                label="Company Email"
                type="email"
                required
                error={errors.companyEmail?.message}
                disabled={isPending}
                {...register("companyEmail")}
              />

              <UIInput
                label="Company Phone"
                required
                error={errors.companyPhone?.message}
                disabled={isPending}
                {...register("companyPhone")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UIInput
                label="Address Line 1"
                required
                error={errors.addressLine1?.message}
                disabled={isPending}
                {...register("addressLine1")}
              />

              <UIInput
                label="Address Line 2 (Optional)"
                error={errors.addressLine2?.message}
                disabled={isPending}
                {...register("addressLine2")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                    value={field.value}
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
                    required
                    options={stateOptions}
                    getOptionLabel={(s) => s.name}
                    getOptionValue={(s) => s.id}
                    value={field.value}
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
                    required
                    options={cityOptions}
                    getOptionLabel={(c) => c.name}
                    getOptionValue={(c) => c.id}
                    value={field.value}
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
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-zinc-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              2. Primary Administrator
            </h2>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UIInput
                label="First Name"
                required
                error={errors.primaryAdministrator?.firstName?.message}
                disabled={isPending}
                {...register("primaryAdministrator.firstName")}
              />

              <UIInput
                label="Last Name"
                required
                error={errors.primaryAdministrator?.lastName?.message}
                disabled={isPending}
                {...register("primaryAdministrator.lastName")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UIInput
                label="Email Address"
                type="email"
                required
                error={errors.primaryAdministrator?.email?.message}
                disabled={isPending}
                {...register("primaryAdministrator.email")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <UIButton
            type="button"
            variant="outline"
            onClick={() => router.push(PAGE_ROUTES.PLATFORM_TENANTS)}
            disabled={isPending}
          >
            Cancel
          </UIButton>
          <UIButton type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Tenant...
              </>
            ) : (
              "Create Tenant"
            )}
          </UIButton>
        </div>
      </form>

      {successData.open && (
        <TenantSuccessDialog
          open={successData.open}
          tenantName={successData.tenantName}
          adminEmail={successData.adminEmail}
          temporaryPassword={successData.temporaryPassword}
          onClose={handleCloseSuccessDialog}
        />
      )}
    </PageContainer>
  );
}
