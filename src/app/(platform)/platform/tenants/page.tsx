import { Suspense } from "react";
import { TenantList } from "@/features/tenants/components/tenant-list";
import { UILoader } from "@/components/common/UILoader/UILoader";

export default function TenantsPage() {
  return (
    <Suspense fallback={<UILoader />}>
      <TenantList />
    </Suspense>
  );
}

