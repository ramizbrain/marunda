import { motion } from "motion/react";

import { formatDuration } from "../../lib/format";
import type { ScanSummary } from "../../types/nodeModules";
import { BrandLogo } from "../brand/BrandMarks";

interface DashboardHeaderProps {
  displayRoot: string;
  summary: ScanSummary | null;
  onHome: () => void;
  onChooseRoot: () => void;
  onRescan: () => void;
}

export function DashboardHeader({ displayRoot, summary, onHome, onChooseRoot, onRescan }: DashboardHeaderProps) {
  return (
    <motion.header
      className="dashboard-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 22 }}
    >
      <button type="button" className="dashboard-header__home" onClick={onHome} aria-label="Back to start">
        <BrandLogo className="dashboard-header__logo" />
      </button>

      {summary && (
        <p className="dashboard-header__summary">
          Scanned {summary.directoriesVisited.toLocaleString("en-US")} folders in{" "}
          {formatDuration(summary.durationMs)}
          {summary.cancelled && " (stopped early)"}
        </p>
      )}

      <div className="dashboard-header__actions">
        <button type="button" className="root-chip root-chip--compact" onClick={onChooseRoot} title="Change folder">
          <span className="root-chip__path">{displayRoot}</span>
          <span className="root-chip__action">Change</span>
        </button>
        <motion.button
          type="button"
          className="button button--primary"
          onClick={onRescan}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
        >
          Scan again
        </motion.button>
      </div>
    </motion.header>
  );
}
