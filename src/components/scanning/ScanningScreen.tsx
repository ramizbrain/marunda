import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import type { ScanStatus } from "../../hooks/scanReducer";
import { totalSize } from "../../lib/entryQuery";
import { formatBytes } from "../../lib/format";
import { SCAN_CELEBRATION_MS, SCAN_SCREEN_MIN_MS } from "../../lib/timing";
import type { NodeModulesEntry, ScanSummary } from "../../types/nodeModules";
import { AnimatedNumber } from "../motion/AnimatedNumber";
import { FoundFeed } from "./FoundFeed";
import { Radar } from "./Radar";

interface ScanningScreenProps {
  status: ScanStatus;
  entries: readonly NodeModulesEntry[];
  directoriesVisited: number;
  currentPath: string;
  summary: ScanSummary | null;
  onCancel: () => void;
  /** Called once the scan is over and the outro animation has played. */
  onOutroComplete: () => void;
}

export function ScanningScreen({
  status,
  entries,
  directoriesVisited,
  currentPath,
  summary,
  onCancel,
  onOutroComplete,
}: ScanningScreenProps) {
  const isCelebrating = useScanOutro(status, summary, onOutroComplete);
  const isScanning = status === "scanning";

  return (
    <motion.main
      className="screen scanning"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96, filter: "blur(8px)", transition: { duration: 0.4 } }}
    >
      <Radar entries={entries} isComplete={isCelebrating} />

      <div className="scanning__panel">
        <div className="scanning__title-slot">
          <AnimatePresence mode="wait">
            <motion.h1
            key={isCelebrating ? "done" : "scanning"}
            className="scanning__title"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {isCelebrating ? "Done!" : <ScanningLabel />}
            </motion.h1>
          </AnimatePresence>
        </div>

        <p className="scanning__path" role="status">
          {isCelebrating
            ? `Found ${entries.length} node_modules ${entries.length === 1 ? "folder" : "folders"}, ready to clean.`
            : currentPath || "Warming up the scanner…"}
        </p>

        <dl className="scanning__stats">
          <Stat label="Folders scanned" value={<AnimatedNumber value={directoriesVisited} />} />
          <Stat label="node_modules" value={<AnimatedNumber value={entries.length} />} />
          <Stat
            label="Total size"
            value={<AnimatedNumber value={totalSize(entries)} format={formatBytes} />}
            highlighted
          />
        </dl>

        <FoundFeed entries={entries} />

        <AnimatePresence>
          {isScanning && (
            <motion.button
              type="button"
              className="button button--ghost scanning__cancel"
              onClick={onCancel}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.96 }}
            >
              Stop
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}

/**
 * Keeps the scanning screen up for at least SCAN_SCREEN_MIN_MS, plays the celebration
 * after a successful scan, then hands over. Returns whether the celebration is showing.
 */
function useScanOutro(status: ScanStatus, summary: ScanSummary | null, onOutroComplete: () => void) {
  const [startedAt] = useState(() => Date.now());
  const [isCelebrating, setIsCelebrating] = useState(false);
  const isOver = status !== "scanning";
  const succeeded = status === "finished" && !summary?.cancelled;

  useEffect(() => {
    if (!isOver) return;
    if (!succeeded) {
      // Failed or cancelled: no reason to make the user wait.
      const timer = setTimeout(onOutroComplete, 0);
      return () => clearTimeout(timer);
    }

    const remaining = Math.max(0, SCAN_SCREEN_MIN_MS - (Date.now() - startedAt));
    let handOver: ReturnType<typeof setTimeout> | undefined;
    const celebrate = setTimeout(() => {
      setIsCelebrating(true);
      handOver = setTimeout(onOutroComplete, SCAN_CELEBRATION_MS);
    }, remaining);

    return () => {
      clearTimeout(celebrate);
      clearTimeout(handOver);
    };
  }, [isOver, succeeded, startedAt, onOutroComplete]);

  return isCelebrating;
}

function ScanningLabel() {
  return (
    <>
      Scanning
      <span className="scanning__dots" aria-hidden="true">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </>
  );
}

interface StatProps {
  label: string;
  value: ReactNode;
  highlighted?: boolean;
}

function Stat({ label, value, highlighted = false }: StatProps) {
  return (
    <div className={`scanning__stat${highlighted ? " scanning__stat--highlighted" : ""}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
