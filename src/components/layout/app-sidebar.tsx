"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Warehouse, LogOut, User, Menu, X, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import {
  useCurrentUser,
  useLogout,
} from "@/features/auth/queries/auth.queries";
import { PAGE_ROUTES } from "@/shared/constants/routes";
import { MESSAGES } from "@/shared/constants/messages";
import { cn } from "@/lib/utils";
import type { Page, Permission } from "@/permissions";
import { BranchSwitcher } from "./branch-switcher";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  page?: Page;
  permission?: Permission;
}

interface AppSidebarProps {
  items: NavItem[];
}

export function AppSidebar({ items }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: user } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success(MESSAGES.AUTH.LOGOUT_SUCCESS);
        router.replace(PAGE_ROUTES.LOGIN);
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || MESSAGES.AUTH.LOGOUT_FAILED,
          );
        } else {
          toast.error(MESSAGES.AUTH.LOGOUT_UNEXPECTED);
        }
      },
    });
  };

  const closeMobileNav = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 border-b bg-white dark:bg-zinc-900 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-600 text-white font-bold">
            <Warehouse className="w-5 h-5" />
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
            WMS Admin
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-xs"
          onClick={closeMobileNav}
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-auto h-full",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-600 text-white shadow-sm">
            <Warehouse className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-tight">
              Warehouse WMS
            </span>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Management Portal
            </span>
          </div>
        </div>

        {/* Branch Switcher Workspace Selector */}
        <BranchSwitcher />

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
            Navigation
          </div>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileNav}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 relative">
          {user && (
            <>
              {isDropdownOpen && (
                <div className="absolute bottom-[calc(100%-8px)] left-4 right-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-md p-1.5 z-50 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {user.email}
                  </span>
                </div>
                <ChevronUp
                  className={cn(
                    "w-4 h-4 text-zinc-400 transition-transform duration-200",
                    isDropdownOpen && "transform rotate-180",
                  )}
                />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
