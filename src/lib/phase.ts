import type { ScanStatus } from "../hooks/scanReducer";
import type { ScanSummary } from "../types/nodeModules";

/** The three full-screen stages of the app. */
export type Phase = "welcome" | "scanning" | "dashboard";

/**
 * Where to go once the scanning screen has finished its outro.
 * A failed scan, or one cancelled before finding anything, goes back to the start.
 */
export function phaseAfterScan(status: ScanStatus, summary: ScanSummary | null, entryCount: number): Phase {
  if (status === "error") return "welcome";
  if (summary?.cancelled && entryCount === 0) return "welcome";
  return "dashboard";
}
