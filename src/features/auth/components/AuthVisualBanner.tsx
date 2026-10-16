"use client";

import { Warehouse } from "lucide-react";

export function AuthVisualBanner() {
  return (
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
  );
}
