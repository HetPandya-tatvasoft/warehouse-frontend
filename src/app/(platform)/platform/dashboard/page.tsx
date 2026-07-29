import { TITLES } from "@/shared/constants/titles";

export default function PlatformDashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {TITLES.DASHBOARD.PLATFORM}
      </h1>
    </div>
  );
}
