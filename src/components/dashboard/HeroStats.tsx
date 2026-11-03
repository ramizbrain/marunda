import { motion } from "motion/react";
import type { Variants } from "motion/react";

import { formatBytes, pluralize } from "../../lib/format";
import { AnimatedNumber } from "../motion/AnimatedNumber";

interface HeroStatsProps {
  totalBytes: number;
  foundCount: number;
  selectedBytes: number;
  selectedCount: number;
}

const container: Variants = { shown: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const card: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  shown: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 180, damping: 22 } },
};

export function HeroStats({ totalBytes, foundCount, selectedBytes, selectedCount }: HeroStatsProps) {
  return (
    <motion.section className="hero-stats" aria-label="Summary" variants={container} initial="hidden" animate="shown">
      <motion.div className="hero-stats__main" variants={card}>
        <span className="hero-stats__eyebrow">Reclaimable</span>
        <AnimatedNumber className="hero-stats__total" value={totalBytes} format={formatBytes} />
        <span className="hero-stats__caption">
          across <strong>{foundCount}</strong> node_modules {foundCount === 1 ? "folder" : "folders"}
        </span>
      </motion.div>

      <motion.div className="hero-stats__card" variants={card}>
        <span className="hero-stats__eyebrow">Found</span>
        <AnimatedNumber className="hero-stats__value" value={foundCount} />
        <span className="hero-stats__caption">{foundCount === 1 ? "project" : "projects"}</span>
      </motion.div>

      <motion.div className="hero-stats__card" data-active={selectedCount > 0} variants={card}>
        <span className="hero-stats__eyebrow">Selected</span>
        <AnimatedNumber className="hero-stats__value" value={selectedBytes} format={formatBytes} />
        <span className="hero-stats__caption">{pluralize(selectedCount, "folder")}</span>
      </motion.div>
    </motion.section>
  );
}
