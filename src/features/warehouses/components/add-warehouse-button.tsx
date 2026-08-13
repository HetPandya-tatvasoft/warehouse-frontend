"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { UIButton, type UIButtonProps } from "@/components/common/UIButton";
import { usePermissions, Page, Permission } from "@/permissions";
import { PAGE_ROUTES } from "@/shared/constants/routes";

type AddWarehouseButtonProps = Pick<UIButtonProps, "className" | "variant" | "size">;

export function AddWarehouseButton({
  className,
  variant,
  size,
}: AddWarehouseButtonProps) {
  const router = useRouter();
  const { can } = usePermissions();

  if (!can(Page.Warehouses, Permission.CREATE)) return null;

  return (
    <UIButton
      leftIcon={<Plus className="size-4" />}
      onClick={() => router.push(PAGE_ROUTES.WAREHOUSES_CREATE)}
      variant={variant}
      size={size}
      className={className}
    >
      Add New Warehouse
    </UIButton>
  );
}
