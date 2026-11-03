import { motion } from "motion/react";

import type { SortKey, SortOrder } from "../../lib/entryQuery";

const SORT_LABELS: Record<SortKey, string> = {
  size: "Size",
  name: "Name",
  lastModified: "Last modified",
};

interface SortTabsProps {
  sortOrder: SortOrder;
  onSortChange: (key: SortKey) => void;
}

/** Segmented control; the highlight glides between options. Clicking the active one flips direction. */
export function SortTabs({ sortOrder, onSortChange }: SortTabsProps) {
  return (
    <div className="sort-tabs" role="group" aria-label="Sort by">
      {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => {
        const isActive = sortOrder.key === key;
        return (
          <button
            key={key}
            type="button"
            className="sort-tabs__option"
            aria-pressed={isActive}
            onClick={() => onSortChange(key)}
          >
            {isActive && (
              <motion.span
                layoutId="sort-tabs-highlight"
                className="sort-tabs__highlight"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="sort-tabs__label">
              {SORT_LABELS[key]}
              {isActive && (
                <motion.span
                  className="sort-tabs__arrow"
                  animate={{ rotate: sortOrder.direction === "asc" ? 180 : 0 }}
                  aria-label={sortOrder.direction === "asc" ? "ascending" : "descending"}
                >
                  ↓
                </motion.span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
