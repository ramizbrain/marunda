const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
const BYTES_PER_UNIT = 1024;

/**
 * Formats a byte count for humans, e.g. `1536` → `"1.5 KB"`.
 *
 * Animated counters pass fractional values while they ease towards a target
 * (e.g. 0.03 on the way down to 0), so the input is rounded to whole bytes first.
 */
export function formatBytes(bytes: number): string {
  const wholeBytes = Number.isFinite(bytes) ? Math.round(bytes) : 0;
  if (wholeBytes <= 0) return "0 B";

  const unitIndex = Math.min(
    Math.floor(Math.log(wholeBytes) / Math.log(BYTES_PER_UNIT)),
    BYTE_UNITS.length - 1,
  );
  const value = wholeBytes / BYTES_PER_UNIT ** unitIndex;
  const decimals = unitIndex === 0 || value >= 100 ? 0 : 1;
  return `${value.toFixed(decimals)} ${BYTE_UNITS[unitIndex]}`;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** `pluralize(1, "folder")` → `"1 folder"`, `pluralize(3, "folder")` → `"3 folders"`. */
export function pluralize(count: number, noun: string): string {
  return `${count.toLocaleString("en-US")} ${noun}${count === 1 ? "" : "s"}`;
}

/** Describes how long ago a timestamp was, e.g. `"3 days ago"`. */
export function formatAge(timestampMs: number | null, nowMs: number = Date.now()): string {
  if (timestampMs === null) return "—";

  const days = Math.floor((nowMs - timestampMs) / MS_PER_DAY);
  if (days < 1) return "today";
  if (days < 30) return `${pluralize(days, "day")} ago`;
  if (days < 365) return `${pluralize(Math.floor(days / 30), "month")} ago`;
  return `${pluralize(Math.floor(days / 365), "year")} ago`;
}

/** Shortens an absolute path by replacing the home directory with `~`. */
export function shortenPath(path: string, homeDirectory: string): string {
  if (!homeDirectory) return path;
  const home = homeDirectory.replace(/[\\/]+$/, "");
  return path === home || path.startsWith(`${home}/`) || path.startsWith(`${home}\\`)
    ? `~${path.slice(home.length)}`
    : path;
}

export function formatDuration(durationMs: number): string {
  return durationMs < 1000 ? `${durationMs} ms` : `${(durationMs / 1000).toFixed(1)} s`;
}
