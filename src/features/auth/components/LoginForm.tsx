"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Warehouse } from "lucide-react";

import { UIInput } from "@/components/common/UIInput";
import { UIButton } from "@/components/common/UIButton";
import { loginSchema, type LoginFormValues } from "../schemas/login.schemas";
import { useLogin } from "../queries/auth.queries";
import { toast } from "sonner";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import { useQueryClient } from "@tanstack/react-query";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.clear();
  }, [queryClient]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data, {
      onSuccess: (response) => {
        toast.success(response.message || MESSAGES.AUTH.LOGIN_SUCCESS);
        reset();
        const redirectUrl =
          searchParams.get("redirect") || PAGE_ROUTES.DASHBOARD;
        router.replace(redirectUrl);
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(error?.response?.data?.message);
        } else {
          toast.error(MESSAGES.COMMON.SOMETHING_WENT_WRONG);
        }
      },
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
      <div className="relative hidden w-full flex-col justify-between bg-zinc-950 p-12 text-white lg:flex lg:w-1/2 overflow-hidden border-r border-zinc-800">
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-zinc-900),transparent_70%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-size-[4rem_4rem]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
            <Warehouse className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight bg-linear-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Warehouse Control & Auditing
            </h2>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Real-time intelligence for warehouse operations.
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              Streamline multi-tenant inventories, track real-time pallet
              allocations, and manage role-based operator permissions from a
              unified portal.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500">
          <p>© 2026 Logistic Technologies. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-zinc-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-zinc-300">
              Support
            </a>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center p-6 md:p-12 lg:w-1/2 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {TITLES.AUTH.SIGN_IN}
            </h3>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:bg-zinc-900/50">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <UIInput
                {...register("email")}
                label="Email Address"
                required
                disabled={isPending}
                error={errors.email?.message}
                autoComplete="email"
                fieldProps={{ className: "space-y-1.5" }}
              />

              <UIInput
                {...register("password")}
                label="Password"
                required
                type="password"
                disabled={isPending}
                error={errors.password?.message}
                autoComplete="current-password"
                fieldProps={{ className: "space-y-1.5" }}
              />

              <div className="flex items-center justify-end -mt-1">
                <Link
                  href={PAGE_ROUTES.FORGOT_PASSWORD}
                  className="text-xs font-medium text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400"
                >
                  Forgot password?
                </Link>
              </div>

              <UIButton
                type="submit"
                fullWidth
                loading={isPending}
                className="mt-6 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 cursor-pointer"
              >
                Sign In
              </UIButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
