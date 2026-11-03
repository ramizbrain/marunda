import { motion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  className?: string;
}

// Clamped so an easing curve can never show "-0".
const formatInteger = (value: number) => Math.max(0, Math.round(value)).toLocaleString("en-US");

/** Counts smoothly towards `value`, starting from zero on first render. */
export function AnimatedNumber({ value, format = formatInteger, className }: AnimatedNumberProps) {
  // Close to critical damping (2·√(stiffness·mass) ≈ 17.5): no overshoot, and no long
  // crawl through tiny values at the end. restDelta lets it settle once within half a unit.
  const spring = useSpring(0, { stiffness: 110, damping: 18, mass: 0.7, restDelta: 0.5 });
  const text = useTransform(spring, format);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{text}</motion.span>;
}
