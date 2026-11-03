import { motion } from "motion/react";

import type { NodeModulesEntry } from "../../types/nodeModules";
import { formatBytes } from "../../lib/format";
import { Checkbox } from "./Checkbox";

/** Rows past this index appear together, so long lists don't take ages to fill in. */
const MAX_STAGGERED_ROWS = 14;

interface EntryRowProps {
  entry: NodeModulesEntry;
  index: number;
  isSelected: boolean;
  sizeRatio: number;
  displayPath: string;
  age: string;
  onToggle: (path: string) => void;
  onReveal: (path: string) => void;
}

export function EntryRow({
  entry,
  index,
  isSelected,
  sizeRatio,
  displayPath,
  age,
  onToggle,
  onReveal,
}: EntryRowProps) {
  const enterDelay = Math.min(index, MAX_STAGGERED_ROWS) * 0.04;

  return (
    <motion.li
      layout="position"
      role="row"
      className="entry-row"
      data-selected={isSelected}
      onClick={() => onToggle(entry.path)}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0, transition: { delay: enterDelay, type: "spring", stiffness: 260, damping: 26 } }}
      exit={{ opacity: 0, x: 60, transition: { duration: 0.3, ease: "easeIn" } }}
      transition={{ type: "spring", stiffness: 400, damping: 36 }}
      whileHover={{ scale: 1.006 }}
    >
      <span role="cell" className="entry-row__check">
        <Checkbox checked={isSelected} label={`Select ${entry.projectName}`} onChange={() => onToggle(entry.path)} />
      </span>

      <span role="cell" className="entry-row__project">
        <span className="entry-row__name">{entry.projectName}</span>
        <span className="entry-row__path" title={entry.projectPath}>
          {displayPath}
        </span>
      </span>

      <span role="cell" className="entry-row__age">
        {age}
      </span>

      <span role="cell" className="entry-row__size">
        <span className="entry-row__bytes">{formatBytes(entry.sizeBytes)}</span>
        <span className="size-meter" aria-hidden="true">
          <motion.span
            className="size-meter__fill"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(sizeRatio * 100, 3)}%` }}
            transition={{ delay: enterDelay + 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </span>
      </span>

      <span role="cell" className="entry-row__actions">
        <motion.button
          type="button"
          className="icon-button"
          title="Show in Finder / Explorer"
          aria-label={`Show ${entry.projectName} in the file manager`}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          onClick={(event) => {
            event.stopPropagation();
            onReveal(entry.path);
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M14 4h6v6M20 4l-9 9M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      </span>
    </motion.li>
  );
}
