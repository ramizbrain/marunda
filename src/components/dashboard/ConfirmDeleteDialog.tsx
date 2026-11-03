import { motion } from "motion/react";
import { useEffect } from "react";

import { totalSize } from "../../lib/entryQuery";
import { formatBytes } from "../../lib/format";
import type { NodeModulesEntry } from "../../types/nodeModules";

interface ConfirmDeleteDialogProps {
  entries: readonly NodeModulesEntry[];
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const MAX_LISTED_PROJECTS = 6;

/** Render inside <AnimatePresence> so it can animate out. */
export function ConfirmDeleteDialog({ entries, isDeleting, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  useCloseOnEscape(onCancel, !isDeleting);

  const listed = entries.slice(0, MAX_LISTED_PROJECTS);
  const hiddenCount = entries.length - listed.length;

  return (
    <motion.div
      className="dialog-backdrop"
      onClick={isDeleting ? undefined : onCancel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        <div className="dialog__badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path
              d="M4 7h16M10 11v6M14 11v6M5.5 7l1 12a2 2 0 0 0 2 1.8h7a2 2 0 0 0 2-1.8l1-12M9 7V4.5h6V7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 id="confirm-delete-title" className="dialog__title">
          Delete {entries.length} node_modules {entries.length === 1 ? "folder" : "folders"}?
        </h2>
        <p className="dialog__body">
          This frees <strong>{formatBytes(totalSize(entries))}</strong>. Folders are deleted permanently (they
          don't go to the Trash). Run <code>npm install</code> again whenever you need a project back.
        </p>

        <ul className="dialog__list">
          {listed.map((entry, index) => (
            <motion.li
              key={entry.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + index * 0.04 }}
            >
              <span>{entry.projectName}</span>
              <span className="dialog__size">{formatBytes(entry.sizeBytes)}</span>
            </motion.li>
          ))}
          {hiddenCount > 0 && <li className="dialog__more">…and {hiddenCount} more</li>}
        </ul>

        <div className="dialog__actions">
          <button type="button" className="button button--ghost" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </button>
          <motion.button
            type="button"
            className="button button--danger"
            onClick={onConfirm}
            disabled={isDeleting}
            autoFocus
            whileTap={{ scale: 0.95 }}
          >
            {isDeleting ? "Deleting…" : "Yes, delete"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function useCloseOnEscape(onClose: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, enabled]);
}
