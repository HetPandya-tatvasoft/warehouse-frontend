"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import axios from "axios";
import { ChevronDown, ChevronRight, Circle, CheckCircle2, Ban } from "lucide-react";

import { UIModal } from "@/components/common/UIModal/UIModal";
import { UIButton } from "@/components/common/UIButton";
import { useUpdateCategory } from "../queries/product-categories.queries";
import { type ICategory } from "../types/product-categories.types";
import type { IApiSuccessResponse } from "@/types/api.types";
import { MESSAGES } from "@/shared/constants/messages";
import { cn } from "@/lib/utils";

interface MoveCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ICategory | null;
  allCategories: ICategory[];
  onSuccess?: (newParentId: string | null) => void;
}

interface TreeSelectNodeProps {
  node: ICategory;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  disabledIds: Set<string>;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  currentCategoryId: string;
}

function TreeSelectNode({
  node,
  selectedId,
  onSelect,
  disabledIds,
  expandedIds,
  onToggleExpand,
  currentCategoryId,
}: TreeSelectNodeProps) {
  const isDisabled = disabledIds.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-sm",
          isDisabled
            ? "opacity-50 cursor-not-allowed bg-zinc-100/50 dark:bg-zinc-800/30"
            : "hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer",
          isSelected && "bg-zinc-100 dark:bg-zinc-800 font-medium"
        )}
        onClick={() => {
          if (!isDisabled) {
            onSelect(node.id);
          }
        }}
      >
        {/* Toggle Expand Chevron */}
        <div className="w-5 h-5 flex items-center justify-center">
          {hasChildren ? (
            <button
              type="button"
              className="p-0.5 rounded-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </button>
          ) : (
            <div className="w-3.5" />
          )}
        </div>

        {/* Selection Bullet / Ban Indicator */}
        <div className="flex items-center justify-center text-zinc-500">
          {isDisabled ? (
            <Ban className="size-4 text-red-500 dark:text-red-400" />
          ) : isSelected ? (
            <CheckCircle2 className="size-4 text-zinc-900 dark:text-zinc-50" />
          ) : (
            <Circle className="size-4" />
          )}
        </div>

        {/* Node Name & Badges */}
        <span
          className={cn(
            "flex-1 truncate",
            isDisabled && "line-through text-zinc-400 dark:text-zinc-600"
          )}
        >
          {node.name}
        </span>
        {isDisabled && (
          <span className="text-[10px] bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-medium">
            {node.id === currentCategoryId ? "Current" : "Descendant"}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="pl-4 border-l border-zinc-200 dark:border-zinc-800 ml-4 space-y-1">
          {node.children.map((child) => (
            <TreeSelectNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              disabledIds={disabledIds}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              currentCategoryId={currentCategoryId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function MoveCategoryModal({
  open,
  onOpenChange,
  category,
  allCategories,
  onSuccess,
}: MoveCategoryModalProps) {
  const { mutate: updateCategory, isPending } = useUpdateCategory();
  const [selectedParentId, setSelectedParentId] = useState<string>("root");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Sync state when category changes without using an effect
  const [prevCategoryId, setPrevCategoryId] = useState<string | null>(null);
  if (category && category.id !== prevCategoryId) {
    setPrevCategoryId(category.id);
    setSelectedParentId(category.parentId || "root");

    // Pre-expand all parent categories when modal opens or category changes
    const ids = new Set<string>();
    const traverse = (node: ICategory) => {
      if (node.children && node.children.length > 0) {
        ids.add(node.id);
        node.children.forEach(traverse);
      }
    };
    allCategories.forEach(traverse);
    setExpandedIds(ids);
  }

  // Find current parent name for display
  const currentParentName = useMemo(() => {
    if (!category || !category.parentId) return "Root (No Parent)";

    const findParent = (nodes: ICategory[]): string | null => {
      for (const node of nodes) {
        if (node.id === category.parentId) return node.name;
        if (node.children) {
          const match = findParent(node.children);
          if (match) return match;
        }
      }
      return null;
    };

    return findParent(allCategories) || "Root (No Parent)";
  }, [category, allCategories]);

  // Compute disabled nodes (the category itself and its descendants)
  const disabledIds = useMemo(() => {
    const ids = new Set<string>();
    if (!category) return ids;

    const traverse = (node: ICategory) => {
      ids.add(node.id);
      node.children?.forEach(traverse);
    };

    traverse(category);
    return ids;
  }, [category]);

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMove = () => {
    if (!category) return;

    const newParentId = selectedParentId === "root" ? null : selectedParentId;

    if (newParentId === category.parentId) {
      toast.info("Category is already under this parent.");
      onOpenChange(false);
      return;
    }

    const payload = {
      name: category.name,
      status: category.status,
      description: category.description || undefined,
      parentId: newParentId,
    };

    updateCategory(
      { id: category.id, payload },
      {
        onSuccess: (res: IApiSuccessResponse<ICategory>) => {
          toast.success(res?.message || "Category reparented successfully.");
          onOpenChange(false);
          if (onSuccess) {
            onSuccess(newParentId);
          }
        },
        onError: (err: unknown) => {
          if (axios.isAxiosError(err)) {
            toast.error(
              err.response?.data?.message || "Failed to reparent category."
            );
          } else {
            toast.error(MESSAGES.COMMON.SOMETHING_WENT_WRONG);
          }
        },
      }
    );
  };

  return (
    <UIModal
      open={open}
      onOpenChange={onOpenChange}
      title="Move Category"
      description={`Choose a new placement in the hierarchy for '${category?.name || ""}'.`}
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
      showCloseButton={!isPending}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <UIButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </UIButton>
          <UIButton
            type="button"
            onClick={handleMove}
            loading={isPending}
          >
            Move Category
          </UIButton>
        </div>
      }
    >
      <div className="py-2 space-y-4">
        {/* Current Parent Info */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Current Parent:</span>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mt-0.5">{currentParentName}</p>
        </div>

        {/* Tree Selector Container */}
        <div>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Select New Parent:</span>
          <div className="mt-1.5 max-h-[300px] overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800 p-2 space-y-1 bg-zinc-50/50 dark:bg-zinc-900/50">
            {/* Root Option */}
            <div
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800",
                selectedParentId === "root" && "bg-zinc-100 dark:bg-zinc-800 font-medium"
              )}
              onClick={() => setSelectedParentId("root")}
            >
              <div className="w-5 h-5" />
              <div className="flex items-center justify-center text-zinc-500">
                {selectedParentId === "root" ? (
                  <CheckCircle2 className="size-4 text-zinc-900 dark:text-zinc-50" />
                ) : (
                  <Circle className="size-4" />
                )}
              </div>
              <span className="flex-1 truncate">Root (No Parent)</span>
            </div>

            {/* Recursive Categories Tree */}
            <div className="pt-1 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
              {allCategories.map((node) => (
                <TreeSelectNode
                  key={node.id}
                  node={node}
                  selectedId={selectedParentId === "root" ? null : selectedParentId}
                  onSelect={(id) => setSelectedParentId(id || "root")}
                  disabledIds={disabledIds}
                  expandedIds={expandedIds}
                  onToggleExpand={handleToggleExpand}
                  currentCategoryId={category?.id || ""}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </UIModal>
  );
}
