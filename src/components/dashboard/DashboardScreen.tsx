import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";

import type { useNodeModulesDeletion } from "../../hooks/useNodeModulesDeletion";
import type { useSelection } from "../../hooks/useSelection";
import { DEFAULT_SORT, filterEntries, nextSortOrder, sortEntries, totalSize } from "../../lib/entryQuery";
import type { SortKey } from "../../lib/entryQuery";
import type { NodeModulesEntry, ScanSummary } from "../../types/nodeModules";
import { Checkbox } from "./Checkbox";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { DashboardHeader } from "./DashboardHeader";
import { DeletionToast } from "./DeletionToast";
import { EmptyResult } from "./EmptyResult";
import { EntryList } from "./EntryList";
import { HeroStats } from "./HeroStats";
import { SelectionBar } from "./SelectionBar";
import { SortTabs } from "./SortTabs";

interface DashboardScreenProps {
  entries: readonly NodeModulesEntry[];
  summary: ScanSummary | null;
  displayRoot: string;
  homeDirectory: string;
  selection: ReturnType<typeof useSelection>;
  deletion: ReturnType<typeof useNodeModulesDeletion>;
  onHome: () => void;
  onChooseRoot: () => void;
  onRescan: () => void;
  onReveal: (path: string) => void;
}

export function DashboardScreen({
  entries,
  summary,
  displayRoot,
  homeDirectory,
  selection,
  deletion,
  onHome,
  onChooseRoot,
  onRescan,
  onReveal,
}: DashboardScreenProps) {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState(DEFAULT_SORT);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const visibleEntries = useMemo(
    () => sortEntries(filterEntries(entries, query), sortOrder),
    [entries, query, sortOrder],
  );
  const selectedEntries = useMemo(
    () => entries.filter((entry) => selection.selected.has(entry.path)),
    [entries, selection.selected],
  );
  const selectedBytes = totalSize(selectedEntries);

  const visiblePaths = visibleEntries.map((entry) => entry.path);
  const selectedVisibleCount = visiblePaths.filter((path) => selection.selected.has(path)).length;
  const allVisibleSelected = visiblePaths.length > 0 && selectedVisibleCount === visiblePaths.length;

  const toggleAllVisible = () => {
    if (allVisibleSelected) selection.deselect(visiblePaths);
    else selection.select(visiblePaths);
  };

  const confirmDelete = async () => {
    await deletion.deleteEntries(selectedEntries);
    setIsConfirmingDelete(false);
  };

  const closeConfirmDialog = useCallback(() => setIsConfirmingDelete(false), []);

  return (
    <motion.main
      className="screen dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
    >
      <DashboardHeader
        displayRoot={displayRoot}
        summary={summary}
        onHome={onHome}
        onChooseRoot={onChooseRoot}
        onRescan={onRescan}
      />

      <HeroStats
        totalBytes={totalSize(entries)}
        foundCount={entries.length}
        selectedBytes={selectedBytes}
        selectedCount={selectedEntries.length}
      />

      <motion.section
        className="panel"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 140, damping: 22 }}
      >
        <div className="panel__toolbar">
          <Checkbox
            checked={allVisibleSelected}
            indeterminate={selectedVisibleCount > 0 && !allVisibleSelected}
            disabled={visiblePaths.length === 0}
            label="Select all visible"
            onChange={toggleAllVisible}
          />
          <label className="search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Search projects or paths…"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              aria-label="Search projects"
            />
          </label>
          <SortTabs
            sortOrder={sortOrder}
            onSortChange={(key: SortKey) => setSortOrder((current) => nextSortOrder(current, key))}
          />
        </div>

        {visibleEntries.length > 0 ? (
          <EntryList
            entries={visibleEntries}
            selected={selection.selected}
            homeDirectory={homeDirectory}
            onToggle={selection.toggle}
            onReveal={onReveal}
          />
        ) : (
          <EmptyResult isFiltered={query.trim() !== "" && entries.length > 0} />
        )}
      </motion.section>

      <SelectionBar
        selectedCount={selectedEntries.length}
        selectedBytes={selectedBytes}
        isDeleting={deletion.isDeleting}
        onClear={selection.clear}
        onDelete={() => setIsConfirmingDelete(true)}
      />

      <DeletionToast report={deletion.report} onDismiss={deletion.dismissReport} />

      <AnimatePresence>
        {isConfirmingDelete && selectedEntries.length > 0 && (
          <ConfirmDeleteDialog
            entries={selectedEntries}
            isDeleting={deletion.isDeleting}
            onConfirm={() => void confirmDelete()}
            onCancel={closeConfirmDialog}
          />
        )}
      </AnimatePresence>
    </motion.main>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
