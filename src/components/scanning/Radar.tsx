import { AnimatePresence, motion } from "motion/react";

import { radarPointFor, toCartesianPercent } from "../../lib/radar";
import type { NodeModulesEntry } from "../../types/nodeModules";
import { SparkleBurst } from "../motion/SparkleBurst";
import { ScanOrb } from "../welcome/ScanOrb";

/** More blips than this just turns into noise. */
const MAX_BLIPS = 120;

interface RadarProps {
  entries: readonly NodeModulesEntry[];
  isComplete: boolean;
}

export function Radar({ entries, isComplete }: RadarProps) {
  return (
    <div className="radar" data-complete={isComplete}>
      <span className="radar__ring radar__ring--1" />
      <span className="radar__ring radar__ring--2" />
      <span className="radar__ring radar__ring--3" />
      <span className="radar__crosshair" />
      <span className="radar__sweep" />
      <span className="radar__wave" />
      <span className="radar__wave radar__wave--late" />

      {entries.slice(0, MAX_BLIPS).map((entry) => {
        const { x, y } = toCartesianPercent(radarPointFor(entry.path));
        return (
          <motion.span
            key={entry.path}
            className="radar__blip"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 14 }}
          />
        );
      })}

      <ScanOrb className="radar__orb" />

      <AnimatePresence>
        {isComplete && (
          <motion.div
            className="radar__done"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
          >
            <svg viewBox="0 0 24 24" width="44" height="44" aria-hidden="true">
              <motion.path
                d="M5 12.5l4.5 4.5L19 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {isComplete && <SparkleBurst burstKey="scan-complete" count={12} radius={190} />}
    </div>
  );
}
