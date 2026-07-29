import Link from "next/link";
import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react";
import { UIButton } from "./UIButton/UIButton";
import { PAGE_ROUTES } from "@/shared/constants/routes";

export function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-2xl w-24 h-24 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        403 - Access Denied
      </h1>
      <p className="max-w-md mt-3 text-base text-zinc-500 dark:text-zinc-400">
        You do not have the required permissions to view this resource. If you believe this is a mistake, please contact your administrator.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
        <UIButton
          variant="outline"
          onClick={() => window.history.back()}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Go Back
        </UIButton>
        <Link href={PAGE_ROUTES.DASHBOARD} passHref className="w-full sm:w-auto">
          <UIButton
            leftIcon={<LayoutDashboard className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Dashboard
          </UIButton>
        </Link>
      </div>
    </div>
  );
}
