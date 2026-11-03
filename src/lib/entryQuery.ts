import type { NodeModulesEntry } from "../types/nodeModules";

export type SortKey = "size" | "name" | "lastModified";
export type SortDirection = "asc" | "desc";

export interface SortOrder {
  key: SortKey;
  direction: SortDirection;
}

export const DEFAULT_SORT: SortOrder = { key: "size", direction: "desc" };

type Comparator = (a: NodeModulesEntry, b: NodeModulesEntry) => number;

const ASCENDING_COMPARATORS: Record<SortKey, Comparator> = {
  size: (a, b) => a.sizeBytes - b.sizeBytes,
  name: (a, b) => a.projectName.localeCompare(b.projectName, undefined, { sensitivity: "base" }),
  // Unknown dates sort as the oldest.
  lastModified: (a, b) => (a.lastModifiedMs ?? 0) - (b.lastModifiedMs ?? 0),
};

/** Returns a new array; the input is never mutated. */
export function sortEntries(entries: readonly NodeModulesEntry[], order: SortOrder): NodeModulesEntry[] {
  const compare = ASCENDING_COMPARATORS[order.key];
  const sign = order.direction === "asc" ? 1 : -1;
  return [...entries].sort((a, b) => sign * compare(a, b) || a.path.localeCompare(b.path));
}

/** Case-insensitive match against the project name and its path. */
export function filterEntries(entries: readonly NodeModulesEntry[], query: string): NodeModulesEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...entries];
  return entries.filter(
    (entry) =>
      entry.projectName.toLowerCase().includes(needle) ||
      entry.projectPath.toLowerCase().includes(needle),
  );
}

/** Clicking the active column flips its direction; a new column starts at its natural default. */
export function nextSortOrder(current: SortOrder, clickedKey: SortKey): SortOrder {
  if (current.key === clickedKey) {
    return { key: clickedKey, direction: current.direction === "asc" ? "desc" : "asc" };
  }
  return { key: clickedKey, direction: clickedKey === "name" ? "asc" : "desc" };
}

export function totalSize(entries: readonly NodeModulesEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.sizeBytes, 0);
}
