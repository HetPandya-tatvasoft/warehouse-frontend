import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { UILoader } from "@/components/common/UILoader/UILoader";

export const metadata: Metadata = {
  title: "Forgot Password | Warehouse Control & Auditing",
  description: "Request a password reset link for your Warehouse Control & Auditing account.",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <UILoader className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950" />
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
