/** A point on the radar, in polar coordinates relative to its center. */
export interface RadarPoint {
  /** Degrees, 0–359. */
  angle: number;
  /** 0 (center) to 1 (outer ring). */
  distance: number;
}

const MIN_DISTANCE = 0.38;

/**
 * Places a found folder on the radar. The position is derived from its path, so the
 * same folder always shows up in the same spot and the layout never jumps.
 */
export function radarPointFor(path: string): RadarPoint {
  const hash = hashString(path);
  const angle = hash % 360;
  const distance = MIN_DISTANCE + ((hash >>> 9) % 1000) / 1000 * (1 - MIN_DISTANCE);
  return { angle, distance };
}

/** Converts a radar point to x/y percentages inside a square box. */
export function toCartesianPercent({ angle, distance }: RadarPoint): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  return {
    x: 50 + Math.cos(radians) * distance * 50,
    y: 50 + Math.sin(radians) * distance * 50,
  };
}

/** FNV-1a: tiny, fast, and well-distributed enough for picking positions. */
function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
