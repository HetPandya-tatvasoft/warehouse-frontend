import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { UILoader } from "@/components/common/UILoader/UILoader";

export const metadata: Metadata = {
  title: "Sign In | Warehouse Control & Auditing",
  description: "Sign in to manage multi-tenant inventories, track pallet allocations, and manage roles.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<UILoader className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950" />}>
      <LoginForm />
    </Suspense>
  );
}