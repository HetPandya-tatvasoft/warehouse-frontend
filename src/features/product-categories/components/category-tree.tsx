"use client";

import type { ICategory } from "../types/product-categories.types";
import { CategoryTreeNode } from "./category-tree-node";

interface CategoryTreeProps {
  categories: ICategory[];
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onActionClick?: (action: string, category: ICategory) => void;
  depth?: number;
}

export function CategoryTree({
  categories,
  expandedIds,
  onToggleExpand,
  onActionClick,
  depth = 0,
}: CategoryTreeProps) {
  return (
    <div className="flex flex-col w-full">
      {categories.map((category) => {
        const isExpanded = expandedIds.has(category.id);
        const hasChildren = category.children && category.children.length > 0;

        return (
          <div key={category.id} className="flex flex-col w-full">
            <CategoryTreeNode
              category={category}
              depth={depth}
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
              onActionClick={onActionClick}
            />
            {hasChildren && isExpanded && (
              <CategoryTree
                categories={category.children}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                onActionClick={onActionClick}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
