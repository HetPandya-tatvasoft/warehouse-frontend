"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Warehouse, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import {
  useCurrentUser,
  useSwitchBranch,
} from "@/features/auth/queries/auth.queries";
import { MESSAGES } from "@/shared/constants/messages";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function BranchSwitcher() {
  const [open, setOpen] = React.useState(false);
  const { data: user } = useCurrentUser();
  const { mutate: switchBranch, isPending } = useSwitchBranch();

  const branches = user?.branches || [];
  const activeBranch = user?.activeBranch || null;

  const handleBranchSwitch = (branchId: string) => {
    if (branchId === activeBranch?.id) {
      setOpen(false);
      return;
    }

    switchBranch(branchId, {
      onSuccess: () => {
        toast.success(MESSAGES.BRANCHES.SWITCH_SUCCESS);
        setOpen(false);
      },
      onError: (error) => {
        let message: string = MESSAGES.BRANCHES.SWITCH_FAILED;
        if (axios.isAxiosError(error)) {
          message = error.response?.data?.message || message;
        } else if (error instanceof Error) {
          message = error.message;
        }
        toast.error(message);
      },
    });
  };

  // If there are no branches or the user is not logged in, don't show the switcher
  if (!user || branches.length === 0) {
    return null;
  }

  const isSingleBranch = branches.length === 1;

  return (
    <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={isSingleBranch || isPending}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-left transition-all duration-200",
              !isSingleBranch &&
                "hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70 hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
              isPending && "opacity-80 cursor-not-allowed",
            )}
            aria-label="Select active branch"
          >
            {/* Branch Icon with Premium Purple Glow/Gradient */}
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 shrink-0 border border-purple-100/50 dark:border-purple-900/30 shadow-xs">
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              ) : (
                <Warehouse className="w-4 h-4" />
              )}
            </div>

            {/* Branch Name & Metadata */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                {activeBranch?.name || "Select Branch"}
              </span>
            </div>

            {/* Dropdown Indicator */}
            {!isSingleBranch && (
              <ChevronsUpDown className="w-4 h-4 text-zinc-400 shrink-0 ml-auto" />
            )}
          </button>
        </PopoverTrigger>

        {!isSingleBranch && (
          <PopoverContent
            className="w-[calc(var(--radix-popover-trigger-width)-32px)] md:w-64 p-0 shadow-lg border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md"
            align="start"
            side="bottom"
            sideOffset={6}
          >
            <Command className="bg-transparent">
              <div className="px-3 pt-3 pb-2 text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase select-none border-b border-zinc-100 dark:border-zinc-800/60">
                Switch Warehouse Branch
              </div>
              <CommandInput
                placeholder="Search branch..."
                className="h-9 border-none focus-visible:ring-0"
              />
              <CommandList className="max-h-[220px] p-1.5">
                <CommandEmpty className="py-4 text-xs text-center text-zinc-500 dark:text-zinc-400">
                  No branches found.
                </CommandEmpty>
                <CommandGroup>
                  {branches.map((branch) => {
                    const isActive = branch.id === activeBranch?.id;
                    return (
                      <CommandItem
                        key={branch.id}
                        value={branch.name}
                        onSelect={() => handleBranchSwitch(branch.id)}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 my-0.5",
                          isActive
                            ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-semibold"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100",
                        )}
                      >
                        <div className="flex items-center justify-center w-5 h-5 shrink-0">
                          {isActive && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="truncate flex-1">{branch.name}</span>
                        {branch.isPrimary && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-100/50 dark:border-purple-900/30 scale-90"
                          >
                            Primary
                          </Badge>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
