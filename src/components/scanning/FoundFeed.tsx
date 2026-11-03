import { AnimatePresence, motion } from "motion/react";

import { formatBytes } from "../../lib/format";
import type { NodeModulesEntry } from "../../types/nodeModules";

const FEED_LENGTH = 4;

interface FoundFeedProps {
  entries: readonly NodeModulesEntry[];
}

/** The most recent finds, newest on top, sliding in as the scanner reports them. */
export function FoundFeed({ entries }: FoundFeedProps) {
  const latest = entries.slice(-FEED_LENGTH).reverse();

  return (
    <ul className="found-feed" aria-label="Latest finds">
      <AnimatePresence initial={false} mode="popLayout">
        {latest.map((entry) => (
          <motion.li
            key={entry.path}
            layout
            className="found-feed__item"
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <span className="found-feed__dot" />
            <span className="found-feed__name">{entry.projectName}</span>
            <span className="found-feed__size">{formatBytes(entry.sizeBytes)}</span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
