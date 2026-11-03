import { useCallback, useState } from "react";

import { deleteNodeModules } from "../services/marundaApi";
import { toErrorMessage } from "../lib/errors";
import { totalSize } from "../lib/entryQuery";
import type { DeletionOutcome, NodeModulesEntry } from "../types/nodeModules";

export interface DeletionReport {
  deletedCount: number;
  freedBytes: number;
  failures: DeletionOutcome[];
}

/**
 * Deletes folders and reports what happened. `onDeleted` receives only the paths
 * that were really removed, so the caller can drop them from its list.
 */
export function useNodeModulesDeletion(onDeleted: (paths: string[]) => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [report, setReport] = useState<DeletionReport | null>(null);

  const deleteEntries = useCallback(
    async (entries: readonly NodeModulesEntry[]) => {
      setIsDeleting(true);
      try {
        const outcomes = await deleteNodeModules(entries.map((entry) => entry.path));
        const deletedPaths = new Set(outcomes.filter((o) => o.success).map((o) => o.path));

        onDeleted([...deletedPaths]);
        setReport({
          deletedCount: deletedPaths.size,
          freedBytes: totalSize(entries.filter((entry) => deletedPaths.has(entry.path))),
          failures: outcomes.filter((o) => !o.success),
        });
      } catch (error) {
        const message = toErrorMessage(error);
        setReport({
          deletedCount: 0,
          freedBytes: 0,
          failures: entries.map((entry) => ({ path: entry.path, success: false, error: message })),
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [onDeleted],
  );

  const dismissReport = useCallback(() => setReport(null), []);

  return { isDeleting, report, deleteEntries, dismissReport };
}
