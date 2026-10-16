"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { UIInput } from "@/components/common/UIInput";
import { UIButton } from "@/components/common/UIButton";
import { AuthVisualBanner } from "./AuthVisualBanner";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/forgot-password.schema";
import { useForgotPassword } from "../queries/auth.queries";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";

export function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    forgotPassword(data, {
      onSuccess: (response) => {
        const message =
          response.message || MESSAGES.AUTH.FORGOT_PASSWORD_SUCCESS;
        toast.success(message);
        setSubmittedEmail(data.email);
        setIsSubmitted(true);
        reset();
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(
            error?.response?.data?.message ||
              MESSAGES.COMMON.SOMETHING_WENT_WRONG,
          );
        } else {
          toast.error(MESSAGES.COMMON.SOMETHING_WENT_WRONG);
        }
      },
    });
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setSubmittedEmail("");
  };

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
                {isSubmitted ? "Check your email" : TITLES.AUTH.FORGOT_PASSWORD}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isSubmitted
                  ? "We've processed your password reset request."
                  : "Enter your registered email address and we'll send you a link to reset your password."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:bg-zinc-900/50">
            {isSubmitted ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {MESSAGES.AUTH.FORGOT_PASSWORD_SUCCESS}
                  </p>
                  {submittedEmail && (
                    <p className="text-xs text-muted-foreground break-all">
                      Sent to:{" "}
                      <span className="font-semibold text-foreground">
                        {submittedEmail}
                      </span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Please check your inbox and follow the instructions in the
                    email. If you don&apos;t receive it in a few minutes, please
                    check your spam folder.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Link href={PAGE_ROUTES.LOGIN} className="block w-full">
                    <UIButton
                      type="button"
                      fullWidth
                      className="bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      Return to Sign In
                    </UIButton>
                  </Link>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors cursor-pointer"
                  >
                    Didn&apos;t receive the email? Try another address
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <UIInput
                  {...register("email")}
                  label="Email Address"
                  placeholder="name@company.com"
                  type="email"
                  required
                  disabled={isPending}
                  error={errors.email?.message}
                  autoComplete="email"
                  fieldProps={{ className: "space-y-1.5" }}
                />

                <UIButton
                  type="submit"
                  fullWidth
                  loading={isPending}
                  disabled={isPending}
                  className="mt-6 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer"
                  leftIcon={<Mail className="h-4 w-4" />}
                >
                  Send Reset Link
                </UIButton>

                <div className="pt-2 text-center">
                  <span className="text-xs text-muted-foreground">
                    Remember your password?{" "}
                    <Link
                      href={PAGE_ROUTES.LOGIN}
                      className="font-medium text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400"
                    >
                      Sign In
                    </Link>
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
