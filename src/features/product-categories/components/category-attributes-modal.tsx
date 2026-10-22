"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import axios from "axios";
import {
  Search,
  Plus,
  ArrowLeft,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Ban,
  Layers,
} from "lucide-react";

import { UIModal } from "@/components/common/UIModal/UIModal";
import { UIButton } from "@/components/common/UIButton";
import { UIInput } from "@/components/common/UIInput/UIInput";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { usePermissions, Page, Permission } from "@/permissions";
import { cn } from "@/lib/utils";
import { MESSAGES } from "@/shared/constants/messages";

import {
  ProductCategoryStatus,
  type ICategory,
  type ICategoryAttribute,
  type IEligibleAttribute,
} from "../types/product-categories.types";
import {
  useCategoryEffectiveAttributes,
  useCategoryEligibleAttributes,
  useAssignCategoryAttributes,
  useUnassignCategoryAttribute,
} from "../queries/product-categories.queries";

interface CategoryAttributesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ICategory | null;
}

export function CategoryAttributesModal({
  open,
  onOpenChange,
  category,
}: CategoryAttributesModalProps) {
  const { can } = usePermissions();
  const canView = can(Page.ProductCategories, Permission.VIEW);
  const canUpdate = can(Page.ProductCategories, Permission.UPDATE);

  const [activeTab, setActiveTab] = useState<"effective" | "assign">(
    "effective",
  );
  const [effectiveSearch, setEffectiveSearch] = useState("");
  const [eligibleSearch, setEligibleSearch] = useState("");
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>(
    [],
  );
  const [unassignCandidate, setUnassignCandidate] =
    useState<ICategoryAttribute | null>(null);

  const resetModalState = () => {
    setActiveTab("effective");
    setEffectiveSearch("");
    setEligibleSearch("");
    setSelectedAttributeIds([]);
    setUnassignCandidate(null);
  };

  const handleModalOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetModalState();
    }
    onOpenChange(nextOpen);
  };

  // Queries
  const {
    data: effectiveResponse,
    isLoading: isLoadingEffective,
    isError: isErrorEffective,
    error: effectiveError,
    refetch: refetchEffective,
  } = useCategoryEffectiveAttributes(category?.id ?? "", {
    enabled: open && Boolean(category?.id) && canView,
  });

  const {
    data: eligibleResponse,
    isLoading: isLoadingEligible,
    isError: isErrorEligible,
    error: eligibleError,
    refetch: refetchEligible,
  } = useCategoryEligibleAttributes(category?.id ?? "", {
    enabled:
      open && Boolean(category?.id) && canUpdate && activeTab === "assign",
  });

  // Mutations
  const { mutate: assignAttributes, isPending: isAssigning } =
    useAssignCategoryAttributes();
  const { mutate: unassignAttribute, isPending: isUnassigning } =
    useUnassignCategoryAttribute();

  const effectiveAttributes: ICategoryAttribute[] = useMemo(() => {
    return effectiveResponse ?? [];
  }, [effectiveResponse]);

  const eligibleAttributes: IEligibleAttribute[] = useMemo(() => {
    return eligibleResponse ?? [];
  }, [eligibleResponse]);

  // Filtered Effective Attributes
  const filteredEffective = useMemo(() => {
    if (!effectiveSearch.trim()) return effectiveAttributes;
    const term = effectiveSearch.toLowerCase().trim();
    return effectiveAttributes.filter(
      (attr) =>
        attr.name.toLowerCase().includes(term) ||
        attr.sourceCategoryName.toLowerCase().includes(term),
    );
  }, [effectiveAttributes, effectiveSearch]);

  // Filtered Eligible Attributes
  const filteredEligible = useMemo(() => {
    if (!eligibleSearch.trim()) return eligibleAttributes;
    const term = eligibleSearch.toLowerCase().trim();
    return eligibleAttributes.filter((attr) =>
      attr.name.toLowerCase().includes(term),
    );
  }, [eligibleAttributes, eligibleSearch]);

  // Active (selectable) eligible attributes within current filter
  const activeSelectableFiltered = useMemo(() => {
    return filteredEligible.filter(
      (attr) => attr.status === ProductCategoryStatus.ACTIVE,
    );
  }, [filteredEligible]);

  const allActiveSelected =
    activeSelectableFiltered.length > 0 &&
    activeSelectableFiltered.every((attr) =>
      selectedAttributeIds.includes(attr.id),
    );

  const handleToggleSelectAll = () => {
    if (allActiveSelected) {
      const activeIdsToRemove = new Set(
        activeSelectableFiltered.map((a) => a.id),
      );
      setSelectedAttributeIds((prev) =>
        prev.filter((id) => !activeIdsToRemove.has(id)),
      );
    } else {
      const newIds = new Set([
        ...selectedAttributeIds,
        ...activeSelectableFiltered.map((a) => a.id),
      ]);
      setSelectedAttributeIds(Array.from(newIds));
    }
  };

  const handleToggleSelect = (attributeId: string, isSelectable: boolean) => {
    if (!isSelectable) return;
    setSelectedAttributeIds((prev) =>
      prev.includes(attributeId)
        ? prev.filter((id) => id !== attributeId)
        : [...prev, attributeId],
    );
  };

  const handleAssignSubmit = () => {
    if (!category || selectedAttributeIds.length === 0) return;

    assignAttributes(
      {
        categoryId: category.id,
        payload: { attributeIds: selectedAttributeIds },
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message);
          setSelectedAttributeIds([]);
          setActiveTab("effective");
        },
        onError: (err: unknown) => {
          if (axios.isAxiosError(err)) {
            toast.error(
              err.response?.data?.message ||
                MESSAGES.PRODUCT_CATEGORIES.ASSIGN_ATTRIBUTES_FAILED,
            );
          } else {
            toast.error(MESSAGES.COMMON.UNEXPECTED_ERROR);
          }
        },
      },
    );
  };

  const handleConfirmUnassign = () => {
    if (!category || !unassignCandidate) return;

    unassignAttribute(
      {
        categoryId: category.id,
        attributeId: unassignCandidate.id,
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message);
          setUnassignCandidate(null);
        },
        onError: (err: unknown) => {
          if (axios.isAxiosError(err)) {
            toast.error(
              err.response?.data?.message ||
                MESSAGES.PRODUCT_CATEGORIES.UNASSIGN_ATTRIBUTE_FAILED,
            );
          } else {
            toast.error(MESSAGES.COMMON.UNEXPECTED_ERROR);
          }
        },
      },
    );
  };

  if (!category && !open) return null;

  return (
    <>
      <UIModal
        open={open}
        onOpenChange={handleModalOpenChange}
        title={category ? `Attributes - ${category.name}` : "Attributes"}
        description="View effective attributes and manage direct assignments for this category."
        size="xl"
        closeOnBackdropClick={!isAssigning && !isUnassigning}
        closeOnEscape={!isAssigning && !isUnassigning}
        showCloseButton={!isAssigning && !isUnassigning}
        footer={
          <div className="flex flex-col-reverse sm:flex-row w-full items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
              {activeTab === "effective" ? (
                <span>
                  Showing {filteredEffective.length} of{" "}
                  {effectiveAttributes.length} effective attribute(s)
                </span>
              ) : (
                <span>
                  {selectedAttributeIds.length} of{" "}
                  {activeSelectableFiltered.length} eligible attribute(s)
                  selected
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
              {activeTab === "assign" ? (
                <>
                  <UIButton
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("effective")}
                    disabled={isAssigning}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </UIButton>
                  <UIButton
                    type="button"
                    onClick={handleAssignSubmit}
                    loading={isAssigning}
                    disabled={selectedAttributeIds.length === 0 || isAssigning}
                    className="flex-1 sm:flex-none"
                  >
                    Assign Selected ({selectedAttributeIds.length})
                  </UIButton>
                </>
              ) : (
                <UIButton
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto"
                >
                  Close
                </UIButton>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Tabs Navigation */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 gap-2">
            <div className="flex gap-2 sm:gap-4 overflow-x-auto">
              <button
                type="button"
                className={cn(
                  "pb-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  activeTab === "effective"
                    ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100 font-semibold"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
                )}
                onClick={() => setActiveTab("effective")}
              >
                Effective Attributes ({effectiveAttributes.length})
              </button>
              {canUpdate && (
                <button
                  type="button"
                  className={cn(
                    "pb-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    activeTab === "assign"
                      ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100 font-semibold"
                      : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
                  )}
                  onClick={() => setActiveTab("assign")}
                >
                  Assign Attributes
                </button>
              )}
            </div>

            {activeTab === "effective" && canUpdate && (
              <UIButton
                size="sm"
                variant="outline"
                leftIcon={<Plus className="size-3.5" />}
                className="hidden sm:inline-flex h-8 text-xs mb-1.5 shrink-0"
                onClick={() => setActiveTab("assign")}
              >
                Assign Attributes
              </UIButton>
            )}
          </div>

          {/* TAB 1: EFFECTIVE ATTRIBUTES */}
          {activeTab === "effective" && (
            <div className="space-y-3">
              {/* Filter input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-zinc-500" />
                <UIInput
                  placeholder="Filter attributes..."
                  value={effectiveSearch}
                  onChange={(e) => setEffectiveSearch(e.target.value)}
                  className="pl-9 h-9"
                  aria-label="Filter effective attributes"
                />
              </div>

              {/* Table / List Container */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
                {isLoadingEffective ? (
                  <div className="p-8 text-center text-sm text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading effective attributes...</span>
                    </div>
                  </div>
                ) : isErrorEffective ? (
                  <div className="p-6 text-center space-y-3">
                    <AlertCircle className="size-8 text-destructive mx-auto" />
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Failed to load attributes
                    </p>
                    <p className="text-xs text-zinc-500">
                      {axios.isAxiosError(effectiveError)
                        ? effectiveError.response?.data?.message ||
                          "Could not fetch effective attributes."
                        : "Something went wrong."}
                    </p>
                    <UIButton
                      size="sm"
                      variant="outline"
                      onClick={() => refetchEffective()}
                    >
                      Try Again
                    </UIButton>
                  </div>
                ) : filteredEffective.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    {effectiveSearch ? (
                      <>
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          No matching attributes
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1">
                          No effective attributes match &quot;{effectiveSearch}
                          &quot;.
                        </p>
                      </>
                    ) : (
                      <>
                        <Layers className="size-8 text-zinc-400 mb-2" />
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          No attributes assigned or inherited
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-sm mt-1">
                          Directly assign attributes to this category, or
                          inherit them from an ancestor category, to make them
                          available for products.
                        </p>
                        {canUpdate && (
                          <UIButton
                            size="sm"
                            leftIcon={<Plus className="size-3.5" />}
                            className="mt-3.5 h-8 text-xs"
                            onClick={() => setActiveTab("assign")}
                          >
                            Assign Attributes
                          </UIButton>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider font-medium">
                        <tr>
                          <th className="py-2.5 px-3">Attribute</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Source Category</th>
                          {canUpdate && (
                            <th className="py-2.5 px-3 text-right">Action</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {filteredEffective.map((attr) => {
                          const isDirect = attr.assignmentType === "DIRECT";
                          const isActive =
                            attr.status === ProductCategoryStatus.ACTIVE;

                          return (
                            <tr
                              key={attr.id}
                              className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                            >
                              <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                                <div className="flex flex-col">
                                  <span>{attr.name}</span>
                                  <span className="text-xs text-zinc-500">
                                    {attr.valueCount}{" "}
                                    {attr.valueCount === 1 ? "value" : "values"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                                    isActive
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                                      : "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
                                  )}
                                >
                                  {attr.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                {isDirect ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
                                    Direct
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800">
                                    Inherited
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400 text-xs">
                                {isDirect ? (
                                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                    This category ({category?.name ?? ""})
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5">
                                    <span>From</span>
                                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                      {attr.sourceCategoryName}
                                    </span>
                                  </span>
                                )}
                              </td>
                              {canUpdate && (
                                <td className="py-2.5 px-3 text-right">
                                  {isDirect ? (
                                    <UIButton
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setUnassignCandidate(attr)}
                                      className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs gap-1"
                                      aria-label={`Unassign ${attr.name}`}
                                    >
                                      <Trash2 className="size-3.5" />
                                      <span>Unassign</span>
                                    </UIButton>
                                  ) : (
                                    <span
                                      className="text-xs text-zinc-400 italic pr-2"
                                      title={`Inherited from ${attr.sourceCategoryName}`}
                                    >
                                      Inherited
                                    </span>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGN ATTRIBUTES */}
          {activeTab === "assign" && canUpdate && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 dark:text-zinc-500" />
                  <UIInput
                    placeholder="Search eligible attributes..."
                    value={eligibleSearch}
                    onChange={(e) => setEligibleSearch(e.target.value)}
                    className="pl-9 h-9"
                    aria-label="Search eligible attributes"
                  />
                </div>

                {activeSelectableFiltered.length > 0 && (
                  <UIButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleToggleSelectAll}
                    className="h-8 text-xs font-medium shrink-0"
                  >
                    {allActiveSelected ? "Deselect All" : "Select All Active"}
                  </UIButton>
                )}
              </div>

              {/* Eligible list container */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
                {isLoadingEligible ? (
                  <div className="p-8 text-center text-sm text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="size-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading eligible attributes...</span>
                    </div>
                  </div>
                ) : isErrorEligible ? (
                  <div className="p-6 text-center space-y-3">
                    <AlertCircle className="size-8 text-destructive mx-auto" />
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Failed to load eligible attributes
                    </p>
                    <p className="text-xs text-zinc-500">
                      {axios.isAxiosError(eligibleError)
                        ? eligibleError.response?.data?.message ||
                          "Could not fetch eligible attributes."
                        : "Something went wrong."}
                    </p>
                    <UIButton
                      size="sm"
                      variant="outline"
                      onClick={() => refetchEligible()}
                    >
                      Try Again
                    </UIButton>
                  </div>
                ) : filteredEligible.length === 0 ? (
                  <div className="p-8 text-center">
                    {eligibleSearch ? (
                      <>
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          No matching attributes
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1">
                          No eligible attributes match &quot;{eligibleSearch}
                          &quot;.
                        </p>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          All attributes assigned
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                          There are no additional active attributes eligible to
                          be assigned to this category. All existing active
                          attributes are already directly assigned or inherited.
                        </p>
                        <UIButton
                          size="sm"
                          variant="outline"
                          leftIcon={<ArrowLeft className="size-3.5" />}
                          className="mt-3.5 h-8 text-xs"
                          onClick={() => setActiveTab("effective")}
                        >
                          Back to Effective Attributes
                        </UIButton>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[360px] overflow-y-auto">
                    {filteredEligible.map((attr) => {
                      const isActive =
                        attr.status === ProductCategoryStatus.ACTIVE;
                      const isSelected = selectedAttributeIds.includes(attr.id);

                      return (
                        <div
                          key={attr.id}
                          className={cn(
                            "flex items-center justify-between py-2.5 px-3 transition-colors",
                            isActive
                              ? "hover:bg-zinc-50 dark:hover:bg-zinc-900/40 cursor-pointer"
                              : "opacity-60 bg-zinc-50/50 dark:bg-zinc-900/20 cursor-not-allowed",
                            isSelected &&
                              "bg-zinc-100/70 dark:bg-zinc-800/40 font-medium",
                          )}
                          onClick={() => handleToggleSelect(attr.id, isActive)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={isSelected}
                              disabled={!isActive}
                              onCheckedChange={() =>
                                handleToggleSelect(attr.id, isActive)
                              }
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Select ${attr.name}`}
                              className="shrink-0"
                            />
                            <div className="flex flex-col flex-1">
                              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 break-words">
                                {attr.name}
                              </span>
                              <span className="text-xs text-zinc-500">
                                {attr.valueCount}{" "}
                                {attr.valueCount === 1 ? "value" : "values"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!isActive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300">
                                <Ban className="size-3" />
                                <span>Inactive &bull; Unavailable</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </UIModal>

      {/* Confirmation Dialog for Direct Attribute Unassignment */}
      <ConfirmDialog
        open={Boolean(unassignCandidate)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isUnassigning) {
            setUnassignCandidate(null);
          }
        }}
        title="Unassign Attribute"
        description={
          unassignCandidate
            ? `Are you sure you want to unassign "${unassignCandidate.name}" from "${category?.name ?? "this category"}"? This removes the assignment from this category, but does not delete the attribute or its predefined values.`
            : "Are you sure you want to unassign this attribute?"
        }
        confirmText="Unassign"
        confirmVariant="destructive"
        onConfirm={handleConfirmUnassign}
        isLoading={isUnassigning}
      />
    </>
  );
}
