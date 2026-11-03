import { motion } from "motion/react";

import { BrandIcon } from "../brand/BrandMarks";

/** Shared between the welcome button and the radar center, so one morphs into the other. */
export const SCAN_ORB_LAYOUT_ID = "scan-orb";

interface ScanOrbProps {
  /** Show the idle "press me" pulse rings. */
  pulsing?: boolean;
  className?: string;
}

export function ScanOrb({ pulsing = false, className = "" }: ScanOrbProps) {
  return (
    <motion.div
      layoutId={SCAN_ORB_LAYOUT_ID}
      className={`scan-orb ${className}`}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    >
      {pulsing && (
        <>
          <span className="scan-orb__pulse" />
          <span className="scan-orb__pulse scan-orb__pulse--late" />
        </>
      )}
      <span className="scan-orb__ring" />
      <span className="scan-orb__core">
        <BrandIcon className="scan-orb__icon" />
      </span>
    </motion.div>
  );
}
