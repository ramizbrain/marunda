import { AnimatePresence, motion } from "motion/react";

import { formatBytes } from "../../lib/format";
import { AnimatedNumber } from "../motion/AnimatedNumber";

interface SelectionBarProps {
  selectedCount: number;
  selectedBytes: number;
  isDeleting: boolean;
  onClear: () => void;
  onDelete: () => void;
}

/** Floating action bar that springs up from the bottom while something is selected. */
export function SelectionBar({ selectedCount, selectedBytes, isDeleting, onClear, onDelete }: SelectionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          className="selection-bar"
          role="region"
          aria-label="Selection actions"
          initial={{ y: 120, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 120, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
        >
          <span className="selection-bar__summary">
            <strong>{selectedCount}</strong> selected
            <span className="selection-bar__divider" />
            <AnimatedNumber className="selection-bar__bytes" value={selectedBytes} format={formatBytes} />
          </span>
          <button type="button" className="button button--ghost" onClick={onClear}>
            Clear
          </button>
          <motion.button
            type="button"
            className="button button--danger"
            onClick={onDelete}
            disabled={isDeleting}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDeleting ? "Deleting…" : `Delete ${selectedCount}`}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
