import type { Phase } from "../../lib/phase";

interface BackdropProps {
  phase: Phase;
}

/**
 * Ambient background shared by every screen: drifting brand-green glows over a dot grid.
 * Each phase tunes it through CSS (see `[data-phase]` in backdrop.css).
 */
export function Backdrop({ phase }: BackdropProps) {
  return (
    <div className="backdrop" data-phase={phase} aria-hidden="true">
      <div className="backdrop__glow backdrop__glow--a" />
      <div className="backdrop__glow backdrop__glow--b" />
      <div className="backdrop__grid" />
      <div className="backdrop__vignette" />
    </div>
  );
}
