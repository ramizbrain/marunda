import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

import type { DeletionReport } from "../../hooks/useNodeModulesDeletion";
import { formatBytes, pluralize } from "../../lib/format";
import { Sparkle } from "../brand/Sparkle";
import { SparkleBurst } from "../motion/SparkleBurst";

const AUTO_DISMISS_MS = 6000;

interface DeletionToastProps {
  report: DeletionReport | null;
  onDismiss: () => void;
}

export function DeletionToast({ report, onDismiss }: DeletionToastProps) {
  const hasFailures = (report?.failures.length ?? 0) > 0;

  // Successes fade away by themselves; failures stay until the user has read them.
  useEffect(() => {
    if (!report || hasFailures) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [report, hasFailures, onDismiss]);

  return (
    <AnimatePresence>
      {report && (
        <motion.div
          className="toast"
          data-variant={hasFailures ? "warning" : "success"}
          role="status"
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          {report.deletedCount > 0 && (
            <div className="toast__success">
              <span className="toast__icon">
                <Sparkle width={18} height={18} />
                <SparkleBurst burstKey={report.freedBytes} count={8} radius={46} />
              </span>
              <p>
                Deleted {pluralize(report.deletedCount, "folder")} and freed{" "}
                <strong>{formatBytes(report.freedBytes)}</strong>.
              </p>
            </div>
          )}
          {hasFailures && (
            <div className="toast__failures">
              <p>Could not delete {pluralize(report.failures.length, "folder")}:</p>
              <ul>
                {report.failures.map((failure) => (
                  <li key={failure.path}>
                    <code>{failure.path}</code>: {failure.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button type="button" className="icon-button toast__close" onClick={onDismiss} aria-label="Dismiss">
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
