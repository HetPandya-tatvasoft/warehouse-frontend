import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { UILoader } from "@/components/common/UILoader/UILoader";

export const metadata: Metadata = {
  title: "Reset Password | Warehouse Control & Auditing",
  description: "Set a new password for your Warehouse Control & Auditing account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <UILoader className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950" />
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
