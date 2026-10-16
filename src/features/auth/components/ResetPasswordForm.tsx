"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

import { UIInput } from "@/components/common/UIInput";
import { UIButton } from "@/components/common/UIButton";
import { AuthVisualBanner } from "./AuthVisualBanner";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/reset-password.schema";
import { useResetPassword } from "../queries/auth.queries";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";

  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    if (!token) {
      setTokenError("Missing reset token");
      return;
    }

    resetPassword(
      {
        token,
        password: data.password,
      },
      {
        onSuccess: (response) => {
          const successMessage =
            response.message || MESSAGES.AUTH.RESET_PASSWORD_SUCCESS;
          toast.success(successMessage);
          setIsSuccess(true);
          setTimeout(() => {
            router.replace(PAGE_ROUTES.LOGIN);
          }, 2500);
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            const errorMessage =
              error?.response?.data?.message ||
              MESSAGES.COMMON.SOMETHING_WENT_WRONG;
            toast.error(errorMessage);

            // Handle invalid or expired token
            if (
              error.response?.status === 401 ||
              errorMessage.toLowerCase().includes("invalid") ||
              errorMessage.toLowerCase().includes("expired")
            ) {
              setTokenError(errorMessage);
            }
          } else {
            toast.error(MESSAGES.COMMON.SOMETHING_WENT_WRONG);
          }
        },
      }
    );
  };

  const isInvalidTokenState = !token || Boolean(tokenError);

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
      <AuthVisualBanner />

      <div className="flex w-full flex-1 items-center justify-center p-6 md:p-12 lg:w-1/2 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-md space-y-6">
          <div>
            <Link
              href={PAGE_ROUTES.LOGIN}
              className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to sign in
            </Link>

            <div className="space-y-1.5 text-left">
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {isSuccess
                  ? "Password reset complete"
                  : isInvalidTokenState
                  ? "Reset link problem"
                  : TITLES.AUTH.RESET_PASSWORD}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isSuccess
                  ? "Your credentials have been successfully updated."
                  : isInvalidTokenState
                  ? "The link you followed could not be verified."
                  : "Enter your new password below to regain access to your account."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:bg-zinc-900/50">
            {isSuccess ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-foreground">
                    Password Reset Successfully!
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {MESSAGES.AUTH.RESET_PASSWORD_SUCCESS} You will be redirected
                    to the sign in page shortly.
                  </p>
                </div>

                <div className="pt-2">
                  <UIButton
                    type="button"
                    fullWidth
                    onClick={() => router.replace(PAGE_ROUTES.LOGIN)}
                    className="bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    Sign In Now
                  </UIButton>
                </div>
              </div>
            ) : isInvalidTokenState ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-foreground">
                    Invalid or Expired Link
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tokenError ||
                      "This password reset link is missing, invalid, or has already expired."}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Link href={PAGE_ROUTES.FORGOT_PASSWORD} className="block w-full">
                    <UIButton
                      type="button"
                      fullWidth
                      className="bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      Request a New Link
                    </UIButton>
                  </Link>

                  <Link
                    href={PAGE_ROUTES.LOGIN}
                    className="inline-block text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
                  >
                    Return to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <UIInput
                  {...register("password")}
                  label="New Password"
                  placeholder="••••••••"
                  type="password"
                  required
                  disabled={isPending}
                  error={errors.password?.message}
                  autoComplete="new-password"
                  description="At least 8 characters with uppercase, lowercase, number, and special character."
                  fieldProps={{ className: "space-y-1.5" }}
                />

                <UIInput
                  {...register("confirmPassword")}
                  label="Confirm Password"
                  placeholder="••••••••"
                  type="password"
                  required
                  disabled={isPending}
                  error={errors.confirmPassword?.message}
                  autoComplete="new-password"
                  fieldProps={{ className: "space-y-1.5" }}
                />

                <UIButton
                  type="submit"
                  fullWidth
                  loading={isPending}
                  disabled={isPending}
                  className="mt-6 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer"
                  leftIcon={<KeyRound className="h-4 w-4" />}
                >
                  Reset Password
                </UIButton>

                <div className="pt-2 text-center">
                  <Link
                    href={PAGE_ROUTES.LOGIN}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
                  >
                    Cancel and return to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
