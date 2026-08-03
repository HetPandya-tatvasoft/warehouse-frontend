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
import { COUNTRY_STATES_MAP, STATE_CITIES_MAP } from "@/shared/constants/locations";

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

  const { register, handleSubmit, control, setValue, formState } =
    useForm<TenantOnboardingFormValues>({
      resolver: zodResolver(tenantOnboardingSchema),
      defaultValues: {
        companyName: "",
        slug: "",
        companyEmail: "",
        companyPhone: "",
        addressLine1: "",
        addressLine2: "",
        country: undefined,
        state: "",
        city: "",
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
  const selectedCountry = useWatch({ control, name: "country" });
  const selectedState = useWatch({ control, name: "state" });
  const companyNameValue = useWatch({ control, name: "companyName" });

  // Auto-generate slug from Company Name
  useEffect(() => {
    if (companyNameValue && !touchedFields.slug) {
      const generatedSlug = companyNameValue
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphen
        .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [companyNameValue, setValue, touchedFields.slug]);

  const stateOptions = selectedCountry
    ? COUNTRY_STATES_MAP[selectedCountry] || []
    : [];
  const cityOptions = selectedState
    ? STATE_CITIES_MAP[selectedState] || []
    : [];

  const onSubmit = (values: TenantOnboardingFormValues) => {
    const payload: ITenantOnboardingDto = {
      ...values,
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            {TITLES.TENANTS.ONBOARD_NEW_TENANT}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Setup a new tenant organization and its primary administrator
            account.
          </p>
        </div>
        <UIButton
          variant="outline"
          size="sm"
          onClick={() => router.push(PAGE_ROUTES.PLATFORM_TENANTS)}
          disabled={isPending}
        >
          Cancel
        </UIButton>
      </div>

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
                name="country"
                render={({ field }) => (
                  <UISelect<string>
                    mode="single"
                    label="Country"
                    required
                    options={[
                      "India",
                      "United States",
                      "Canada",
                      "United Kingdom",
                      "Australia",
                    ]}
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
                    required
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
                    required
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
    </div>
  );
}
