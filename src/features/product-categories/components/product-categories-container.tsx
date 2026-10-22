"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import axios from "axios";
import { PageHeader, PageContainer } from "@/components/common";
import { UIButton } from "@/components/common/UIButton";
import { UIInput } from "@/components/common/UIInput/UIInput";
import { UIErrorState } from "@/components/common/UIErrorState/UIErrorState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";

import {
  ProductCategoryStatus,
  type ICategory,
} from "../types/product-categories.types";
import type { IApiSuccessResponse } from "@/types/api.types";
import { CategoryFormModal } from "./category-form-modal";
import { MoveCategoryModal } from "./move-category-modal";
import { CategoryAttributesModal } from "./category-attributes-modal";
import {
  useCategoryTree,
  useUpdateCategory,
  useDeleteCategory,
} from "../queries/product-categories.queries";
import { CategoryTree } from "./category-tree";
import { usePermissions, Page, Permission } from "@/permissions";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";

// Helper to recursively collect all category IDs that have children
const getAllIdsWithChildren = (nodes: ICategory[]): string[] => {
  const ids: string[] = [];
  nodes.forEach((node) => {
    if (node.children && node.children.length > 0) {
      ids.push(node.id);
      ids.push(...getAllIdsWithChildren(node.children));
    }
  });
  return ids;
};

// Skeleton loading tree component mimicking hierarchical nodes
function CategoryTreeSkeleton() {
  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {[0, 1, 2, 1, 2, 0, 1].map((depth, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between py-3.5 px-3"
          style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        >
          <div className="flex items-center gap-3 w-1/3">
            <div className="size-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
            <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="size-8 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductCategoriesContainer() {
  const searchParams = useSearchParams();
  const { can } = usePermissions();

  // Dialog / Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] =
    useState<ICategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ICategory | null>(
    null,
  );
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Move Category Modal state
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [movingCategory, setMovingCategory] = useState<ICategory | null>(null);

  // Attributes Modal state
  const [isAttributesModalOpen, setIsAttributesModalOpen] = useState(false);
  const [selectedCategoryForAttributes, setSelectedCategoryForAttributes] =
    useState<ICategory | null>(null);

  // Form parent category state
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [formParentName, setFormParentName] = useState<string>("");

  // Status toggle duplicate action protection state
  const [statusTogglingId, setStatusTogglingId] = useState<string | null>(null);

  // Search input & debounced search term
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Expansion states
  const [userExpandedIds, setUserExpandedIds] = useState<Set<string>>(
    new Set(),
  );

  // Simulation parameters from URL query params (e.g. ?demo_loading=true)
  const demoLoading = searchParams.get("demo_loading") === "true";
  const demoError = searchParams.get("demo_error") === "true";
  const demoEmpty = searchParams.get("demo_empty") === "true";

  // Real TanStack Query tree data source
  const {
    data: response,
    isLoading: queryLoading,
    isError: queryError,
    error,
  } = useCategoryTree();
  const { mutate: updateCategory } = useUpdateCategory();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  useEffect(() => {
    if (queryError) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            MESSAGES.PRODUCT_CATEGORIES.LOAD_FAILED,
        );
      } else {
        toast.error(MESSAGES.PRODUCT_CATEGORIES.LOAD_UNEXPECTED);
      }
    }
  }, [queryError, error]);

  const isLoading = queryLoading || demoLoading;
  const isError = queryError || demoError;

  const rawCategories = useMemo(() => {
    if (demoEmpty) return [];
    return response ?? [];
  }, [response, demoEmpty]);

  // Debounce search query parameter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Recursive search tree function. Collects auto-expanded IDs of ancestor nodes
  const filterTreeAndGetAncestors = useCallback(
    (
      nodes: ICategory[],
      term: string,
    ): { filteredNodes: ICategory[]; autoExpandedIds: Set<string> } => {
      const autoExpandedIds = new Set<string>();
      if (!term.trim()) {
        return { filteredNodes: nodes, autoExpandedIds };
      }

      const lowercaseTerm = term.toLowerCase();

      const filterNode = (
        node: ICategory,
        isParentMatch: boolean,
      ): ICategory | null => {
        const isSelfMatch = node.name.toLowerCase().includes(lowercaseTerm);
        const keepAllDescendants = isParentMatch || isSelfMatch;

        const matchingChildren = node.children
          ? node.children
              .map((child) => filterNode(child, keepAllDescendants))
              .filter((child): child is ICategory => child !== null)
          : [];

        const hasMatchingChildren = matchingChildren.length > 0;

        if (isSelfMatch || hasMatchingChildren) {
          if (hasMatchingChildren) {
            autoExpandedIds.add(node.id);
          }
          return {
            ...node,
            children: keepAllDescendants
              ? node.children || []
              : matchingChildren,
          };
        }
        return null;
      };

      const filteredNodes = nodes
        .map((node) => filterNode(node, false))
        .filter((node): node is ICategory => node !== null);

      return { filteredNodes, autoExpandedIds };
    },
    [],
  );

  // Compute search-filtered tree and matching ancestors
  const { filteredNodes: filteredCategories, autoExpandedIds } = useMemo(() => {
    return filterTreeAndGetAncestors(rawCategories, debouncedSearch);
  }, [rawCategories, debouncedSearch, filterTreeAndGetAncestors]);

  // Combined expansion state: user manual expanded items + auto-expanded matching paths during search
  const expandedIds = useMemo(() => {
    if (debouncedSearch.trim()) {
      return new Set([
        ...Array.from(userExpandedIds),
        ...Array.from(autoExpandedIds),
      ]);
    }
    return userExpandedIds;
  }, [userExpandedIds, autoExpandedIds, debouncedSearch]);

  const handleToggleExpand = useCallback((id: string) => {
    setUserExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    const allIds = getAllIdsWithChildren(rawCategories);
    setUserExpandedIds(new Set(allIds));
  }, [rawCategories]);

  const handleCollapseAll = useCallback(() => {
    setUserExpandedIds(new Set());
  }, []);

  // Action menu triggers
  const handleActionClick = useCallback(
    (action: string, category: ICategory) => {
      switch (action) {
        case "add_child":
          setSelectedCategoryForEdit(null);
          setFormParentId(category.id);
          setFormParentName(category.name);
          setIsFormModalOpen(true);
          break;
        case "edit":
          setSelectedCategoryForEdit(category);
          setFormParentId(null);
          setFormParentName("");
          setIsFormModalOpen(true);
          break;
        case "move":
          setMovingCategory(category);
          setIsMoveModalOpen(true);
          break;
        case "attributes":
          setSelectedCategoryForAttributes(category);
          setIsAttributesModalOpen(true);
          break;
        case "toggle_status":
          if (statusTogglingId) return; // Prevent duplicate status toggling calls
          const nextStatus =
            category.status === ProductCategoryStatus.ACTIVE
              ? ProductCategoryStatus.INACTIVE
              : ProductCategoryStatus.ACTIVE;

          setStatusTogglingId(category.id);
          updateCategory(
            {
              id: category.id,
              payload: {
                name: category.name,
                description: category.description || undefined,
                status: nextStatus,
              },
            },
            {
              onSuccess: (res: IApiSuccessResponse<ICategory>) => {
                toast.success(res?.message);
                setStatusTogglingId(null);
              },
              onError: (err: unknown) => {
                if (axios.isAxiosError(err)) {
                  toast.error(
                    err.response?.data?.message ||
                      MESSAGES.PRODUCT_CATEGORIES.UPDATE_FAILED,
                  );
                } else {
                  toast.error(MESSAGES.COMMON.UNEXPECTED_ERROR);
                }
                setStatusTogglingId(null);
              },
            },
          );
          break;
        case "delete":
          setDeletingCategory(category);
          setIsConfirmDeleteOpen(true);
          break;
        default:
          break;
      }
    },
    [updateCategory, statusTogglingId],
  );

  const handleOpenCreateModal = useCallback(() => {
    setSelectedCategoryForEdit(null);
    setFormParentId(null);
    setFormParentName("");
    setIsFormModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deletingCategory) return;

    deleteCategory(deletingCategory.id, {
      onSuccess: (res: IApiSuccessResponse<null>) => {
        toast.success(res?.message);
        setIsConfirmDeleteOpen(false);
        setDeletingCategory(null);
      },
      onError: (err: unknown) => {
        if (axios.isAxiosError(err)) {
          toast.error(
            err.response?.data?.message ||
              MESSAGES.PRODUCT_CATEGORIES.DELETE_FAILED,
          );
        } else {
          toast.error(MESSAGES.COMMON.UNEXPECTED_ERROR);
        }
      },
    });
  }, [deletingCategory, deleteCategory]);

  return (
    <PageContainer>
      <PageHeader
        title={TITLES.PRODUCT_CATEGORIES.CATEGORY_MANAGEMENT}
        description="Manage your product category hierarchy"
      >
        {can(Page.ProductCategories, Permission.CREATE) && (
          <UIButton
            leftIcon={<Plus className="size-4" />}
            onClick={handleOpenCreateModal}
            className="h-9"
          >
            Add Category
          </UIButton>
        )}
      </PageHeader>

      {/* Error state view */}
      {isError ? (
        <UIErrorState
          title="Failed to load categories"
          description="There was an error loading the category hierarchy. Please refresh the page or try again later."
          actionText="Try Again"
          onAction={() => window.location.reload()}
        />
      ) : (
        <div className="space-y-4">
          {/* Controls Bar: Search & Expand/Collapse shortcuts */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/20 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-zinc-500" />
              <UIInput
                placeholder="Search categories..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-9"
                aria-label="Search product categories"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <UIButton
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
                onClick={handleExpandAll}
                disabled={isLoading || rawCategories.length === 0}
              >
                Expand All
              </UIButton>
              <UIButton
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
                onClick={handleCollapseAll}
                disabled={isLoading || rawCategories.length === 0}
              >
                Collapse All
              </UIButton>
            </div>
          </div>

          {/* Core Categories tree view wrapper */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
            {isLoading ? (
              <CategoryTreeSkeleton />
            ) : filteredCategories.length === 0 ? (
              /* Empty state view */
              <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
                {debouncedSearch ? (
                  <>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      No matching categories
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Try searching with another keyword or term.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      No categories yet
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                      Create your first product category to start building your
                      category hierarchy.
                    </p>
                    {can(Page.ProductCategories, Permission.CREATE) && (
                      <UIButton
                        leftIcon={<Plus className="size-4" />}
                        onClick={handleOpenCreateModal}
                        className="mt-4 h-9"
                      >
                        Add Category
                      </UIButton>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* Recursive tree rendering */
              <CategoryTree
                categories={filteredCategories}
                expandedIds={expandedIds}
                onToggleExpand={handleToggleExpand}
                onActionClick={handleActionClick}
              />
            )}
          </div>
        </div>
      )}

      {/* Form Modal (Create/Edit) */}
      <CategoryFormModal
        open={isFormModalOpen}
        onOpenChange={(open) => {
          setIsFormModalOpen(open);
          if (!open) {
            setSelectedCategoryForEdit(null);
            setFormParentId(null);
            setFormParentName("");
          }
        }}
        category={selectedCategoryForEdit}
        parentId={formParentId}
        parentName={formParentName}
        onSuccess={() => {
          if (formParentId) {
            setUserExpandedIds((prev) => {
              const next = new Set(prev);
              next.add(formParentId);
              return next;
            });
          }
        }}
      />

      {/* Move/Reparent Modal */}
      <MoveCategoryModal
        open={isMoveModalOpen}
        onOpenChange={(open) => {
          setIsMoveModalOpen(open);
          if (!open) {
            setMovingCategory(null);
          }
        }}
        category={movingCategory}
        allCategories={rawCategories}
        onSuccess={(newParentId) => {
          if (newParentId) {
            setUserExpandedIds((prev) => {
              const next = new Set(prev);
              next.add(newParentId);
              return next;
            });
          }
        }}
      />

      {/* Attributes Management Modal */}
      <CategoryAttributesModal
        key={selectedCategoryForAttributes?.id ?? "none"}
        open={isAttributesModalOpen}
        onOpenChange={(open) => {
          setIsAttributesModalOpen(open);
        }}
        category={selectedCategoryForAttributes}
      />

      {/* Confirmation Dialog Placeholder (Delete) */}
      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={(open) => {
          setIsConfirmDeleteOpen(open);
          if (!open) {
            setDeletingCategory(null);
          }
        }}
        title="Delete Category"
        description={
          deletingCategory
            ? `Are you sure you want to delete the category '${deletingCategory.name}'? This action cannot be undone.`
            : "Are you sure you want to delete this category?"
        }
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </PageContainer>
  );
}
