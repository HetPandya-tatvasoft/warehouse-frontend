"use client";

import {
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  Pencil,
  Move,
  Tag,
  Power,
  Trash2,
} from "lucide-react";
import {
  ProductCategoryStatus,
  type ICategory,
} from "../types/product-categories.types";
import { usePermissions, Page, Permission } from "@/permissions";
import { UIButton } from "@/components/common/UIButton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface CategoryTreeNodeProps {
  category: ICategory;
  depth: number;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onActionClick?: (action: string, category: ICategory) => void;
}

export function CategoryTreeNode({
  category,
  depth,
  isExpanded,
  onToggleExpand,
  onActionClick,
}: CategoryTreeNodeProps) {
  const { can } = usePermissions();

  const hasChildren = category.children && category.children.length > 0;

  const hasViewPermission = can(Page.ProductCategories, Permission.VIEW);
  const hasCreatePermission = can(Page.ProductCategories, Permission.CREATE);
  const hasUpdatePermission = can(Page.ProductCategories, Permission.UPDATE);
  const hasDeletePermission = can(Page.ProductCategories, Permission.DELETE);

  // Status styling classes matching existing status colors in users/categories containers
  const statusColors = {
    [ProductCategoryStatus.ACTIVE]:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    [ProductCategoryStatus.INACTIVE]:
      "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggleExpand(category.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (hasChildren) {
        onToggleExpand(category.id);
      }
    }
  };

  return (
    <div
      className="flex items-center justify-between py-2.5 px-3 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
      style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Chevron Expand/Collapse Control or Spacer */}
        {hasChildren ? (
          <button
            type="button"
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className="flex items-center justify-center size-5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
            aria-label={
              isExpanded
                ? `Collapse ${category.name}`
                : `Expand ${category.name}`
            }
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
        ) : (
          <div className="size-5 shrink-0" /> /* Visual alignment spacer */
        )}

        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
            {category.name}
          </span>
          {category.description && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[280px] sm:max-w-md md:max-w-lg">
              {category.description}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 pl-2">
        {/* Status Badge */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            statusColors[category.status] ||
            "bg-zinc-50 text-zinc-700 border-zinc-200"
          }`}
        >
          {category.status}
        </span>

        {/* Action Menu */}
        {(hasViewPermission ||
          hasCreatePermission ||
          hasUpdatePermission ||
          hasDeletePermission) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <UIButton
                variant="ghost"
                size="icon"
                className="size-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-400"
                aria-label="Actions menu"
              >
                <MoreVertical className="size-4" />
              </UIButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {hasCreatePermission && (
                <DropdownMenuItem
                  onClick={() => onActionClick?.("add_child", category)}
                  className="gap-2 cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>Add Child</span>
                </DropdownMenuItem>
              )}
              {hasUpdatePermission && (
                <>
                  <DropdownMenuItem
                    onClick={() => onActionClick?.("edit", category)}
                    className="gap-2 cursor-pointer"
                  >
                    <Pencil className="size-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onActionClick?.("move", category)}
                    className="gap-2 cursor-pointer"
                  >
                    <Move className="size-4" />
                    <span>Move</span>
                  </DropdownMenuItem>
                </>
              )}
              {hasViewPermission && (
                <DropdownMenuItem
                  onClick={() => onActionClick?.("attributes", category)}
                  className="gap-2 cursor-pointer"
                >
                  <Tag className="size-4" />
                  <span>Attributes</span>
                </DropdownMenuItem>
              )}
              {hasUpdatePermission && (
                <DropdownMenuItem
                  onClick={() => onActionClick?.("toggle_status", category)}
                  className="gap-2 cursor-pointer"
                >
                  <Power className="size-4" />
                  <span>
                    {category.status === ProductCategoryStatus.ACTIVE
                      ? "Deactivate"
                      : "Activate"}
                  </span>
                </DropdownMenuItem>
              )}

              {hasDeletePermission && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onActionClick?.("delete", category)}
                    className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
