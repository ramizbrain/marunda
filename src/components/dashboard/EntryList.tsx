import { AnimatePresence } from "motion/react";
import { useState } from "react";

import { formatAge, shortenPath } from "../../lib/format";
import type { NodeModulesEntry } from "../../types/nodeModules";
import { EntryRow } from "./EntryRow";

interface EntryListProps {
  entries: readonly NodeModulesEntry[];
  selected: ReadonlySet<string>;
  homeDirectory: string;
  onToggle: (path: string) => void;
  onReveal: (path: string) => void;
}

export function EntryList({ entries, selected, homeDirectory, onToggle, onReveal }: EntryListProps) {
  // Ages are relative to when the list first rendered, which keeps rendering pure.
  const [now] = useState(() => Date.now());
  const largestSize = Math.max(0, ...entries.map((entry) => entry.sizeBytes));

  return (
    <div role="table" aria-label="node_modules folders" className="entry-list">
      <ul role="rowgroup" className="entry-list__rows">
        <AnimatePresence mode="popLayout">
          {entries.map((entry, index) => (
            <EntryRow
              key={entry.path}
              entry={entry}
              index={index}
              isSelected={selected.has(entry.path)}
              sizeRatio={largestSize > 0 ? entry.sizeBytes / largestSize : 0}
              displayPath={shortenPath(entry.projectPath, homeDirectory)}
              age={formatAge(entry.lastModifiedMs, now)}
              onToggle={onToggle}
              onReveal={onReveal}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
