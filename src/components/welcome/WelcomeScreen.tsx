import { AnimatePresence, motion } from "motion/react";
import type { Variants } from "motion/react";

import { BrandLogo } from "../brand/BrandMarks";
import { ScanOrb } from "./ScanOrb";

interface WelcomeScreenProps {
  displayRoot: string;
  canScan: boolean;
  error: string | null;
  onScan: () => void;
  onChooseRoot: () => void;
}

const stagger: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 90, damping: 18 } },
};

export function WelcomeScreen({ displayRoot, canScan, error, onScan, onChooseRoot }: WelcomeScreenProps) {
  return (
    <motion.main
      className="screen welcome"
      variants={stagger}
      initial="hidden"
      animate="shown"
      exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)", transition: { duration: 0.45 } }}
    >
      <motion.div variants={rise}>
        <BrandLogo className="welcome__logo" />
      </motion.div>

      <motion.h1 className="welcome__title" variants={rise}>
        Reclaim your disk from <span className="text-gradient">node_modules</span>
      </motion.h1>

      <motion.p className="welcome__subtitle" variants={rise}>
        Marunda finds every <code>node_modules</code> on your machine, shows how much space each one takes,
        and cleans them up in one click.
      </motion.p>

      <motion.div variants={rise}>
        <motion.button
          type="button"
          className="welcome__scan"
          onClick={onScan}
          disabled={!canScan}
          aria-label="Start scan"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
        >
          <ScanOrb pulsing />
          <span className="welcome__scan-label">Start scan</span>
        </motion.button>
      </motion.div>

      <motion.button type="button" className="root-chip" onClick={onChooseRoot} variants={rise}>
        <FolderIcon />
        <span className="root-chip__path">{displayRoot || "Choose a folder"}</span>
        <span className="root-chip__action">Change</span>
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.p
            key={error}
            className="welcome__error"
            role="alert"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            Scan failed: {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4.2l2 2.2h8.8A1.5 1.5 0 0 1 21 9.7v8.8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5Z"
      />
    </svg>
  );
}
