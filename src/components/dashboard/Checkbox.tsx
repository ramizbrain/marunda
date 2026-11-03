import { motion } from "motion/react";
import { useEffect, useRef } from "react";

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label: string;
  onChange: () => void;
}

/** A native checkbox (for keyboard and screen readers) with an animated custom face. */
export function Checkbox({ checked, indeterminate = false, disabled = false, label, onChange }: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isOn = checked || indeterminate;

  // `indeterminate` exists only as a DOM property, not as an HTML attribute.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className="checkbox" data-on={isOn} onClick={(event) => event.stopPropagation()}>
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={label}
      />
      <motion.span
        className="checkbox__face"
        animate={{ scale: isOn ? [1, 0.85, 1] : 1 }}
        transition={{ duration: 0.25 }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 16 16" width="12" height="12">
          <motion.path
            d={indeterminate ? "M3.5 8h9" : "M3.5 8.5l3 3 6-6.5"}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: isOn ? 1 : 0, opacity: isOn ? 1 : 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          />
        </svg>
      </motion.span>
    </label>
  );
}
