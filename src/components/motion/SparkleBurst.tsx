import { motion } from "motion/react";

import { Sparkle } from "../brand/Sparkle";

interface SparkleBurstProps {
  /** Change this to replay the burst. */
  burstKey: string | number;
  count?: number;
  radius?: number;
}

/** Brand sparkles flying out from the center: the "it's clean now" moment. */
export function SparkleBurst({ burstKey, count = 10, radius = 120 }: SparkleBurstProps) {
  return (
    <div className="sparkle-burst" key={burstKey} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 + (index % 2) * 0.3;
        const distance = radius * (0.65 + (index % 3) * 0.2);
        return (
          <motion.span
            key={index}
            className="sparkle-burst__particle"
            initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: [0, 1.1, 0],
              opacity: [1, 1, 0],
              rotate: 90,
            }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: (index % 4) * 0.03 }}
          >
            <Sparkle />
          </motion.span>
        );
      })}
    </div>
  );
}
