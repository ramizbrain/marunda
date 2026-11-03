/** Mirrors `NodeModulesEntry` in src-tauri/src/models.rs. */
export interface NodeModulesEntry {
  path: string;
  projectPath: string;
  projectName: string;
  sizeBytes: number;
  lastModifiedMs: number | null;
}

/** Mirrors `ScanSummary` in src-tauri/src/models.rs. */
export interface ScanSummary {
  totalFound: number;
  totalBytes: number;
  directoriesVisited: number;
  cancelled: boolean;
  durationMs: number;
}

/** Mirrors `ScanEvent` in src-tauri/src/models.rs. */
export type ScanEvent =
  | { event: "found"; data: { entry: NodeModulesEntry } }
  | { event: "progress"; data: { directoriesVisited: number; currentPath: string } }
  | { event: "finished"; data: ScanSummary };

/** Mirrors `DeletionOutcome` in src-tauri/src/models.rs. */
export interface DeletionOutcome {
  path: string;
  success: boolean;
  error: string | null;
}
