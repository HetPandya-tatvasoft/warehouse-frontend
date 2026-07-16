import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | Warehouse Control & Auditing",
  description: "Sign in to manage multi-tenant inventories, track pallet allocations, and manage roles.",
};

export default function LoginPage() {
  return (
    // added suspense because useSearchParams can make you wait
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}