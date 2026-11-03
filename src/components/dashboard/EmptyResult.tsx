import { motion } from "motion/react";

import { Sparkle } from "../brand/Sparkle";

interface EmptyResultProps {
  isFiltered: boolean;
}

export function EmptyResult({ isFiltered }: EmptyResultProps) {
  return (
    <motion.div
      className="empty-result"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <motion.span
        className="empty-result__sparkle"
        animate={{ rotate: [0, 90, 180], scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkle width={48} height={48} />
      </motion.span>
      <p className="empty-result__title">{isFiltered ? "No matches" : "All clean!"}</p>
      <p className="empty-result__hint">
        {isFiltered ? "Try a different search." : "There are no node_modules left in this folder."}
      </p>
    </motion.div>
  );
}
