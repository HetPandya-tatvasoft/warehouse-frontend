"use client";

import {
  useCurrentUser,
  useLogout,
} from "@/features/auth/queries/auth.queries";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data, isLoading } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const router = useRouter();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Logout successful");
        router.replace(PAGE_ROUTES.LOGIN);
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || "Logout failed");
        } else {
          toast.error("Something went wrong, try again later!");
        }
      },
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-zinc-500">Loading session...</div>;
  }

  return (
    <div className="p-8 max-w-md mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-zinc-500">Welcome to your dashboard.</p>
      </div>

      <div className="space-y-3 border-t border-b py-4">
        <div>
          <span className="text-xs text-zinc-400 block">Email Address</span>
          <span className="text-sm font-medium">{data?.email}</span>
        </div>
        <div>
          <span className="text-xs text-zinc-400 block">User Role</span>
          <span className="text-sm font-medium capitalize">{data?.roles?.join(", ") || "Operator"}</span>
        </div>
        <div>
          <span className="text-xs text-zinc-400 block">User ID</span>
          <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">{data?.userId}</span>
        </div>
      </div>

      <Button onClick={handleLogout} disabled={isLoggingOut} className="w-full">
        Log out
      </Button>
    </div>
  );
}

