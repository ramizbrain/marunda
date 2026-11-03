import type { NodeModulesEntry, ScanEvent, ScanSummary } from "../types/nodeModules";

export type ScanStatus = "idle" | "scanning" | "finished" | "error";

export interface ScanState {
  status: ScanStatus;
  entries: NodeModulesEntry[];
  directoriesVisited: number;
  currentPath: string;
  summary: ScanSummary | null;
  error: string | null;
}

export type ScanAction =
  | { type: "started" }
  | { type: "eventReceived"; event: ScanEvent }
  | { type: "failed"; message: string }
  | { type: "entriesRemoved"; paths: readonly string[] };

export const initialScanState: ScanState = {
  status: "idle",
  entries: [],
  directoriesVisited: 0,
  currentPath: "",
  summary: null,
  error: null,
};

export function scanReducer(state: ScanState, action: ScanAction): ScanState {
  switch (action.type) {
    case "started":
      return { ...initialScanState, status: "scanning" };
    case "eventReceived":
      return applyScanEvent(state, action.event);
    case "failed":
      return { ...state, status: "error", error: action.message };
    case "entriesRemoved":
      return removeEntries(state, action.paths);
  }
}

function applyScanEvent(state: ScanState, scanEvent: ScanEvent): ScanState {
  switch (scanEvent.event) {
    case "found":
      return { ...state, entries: [...state.entries, scanEvent.data.entry] };
    case "progress":
      return {
        ...state,
        directoriesVisited: scanEvent.data.directoriesVisited,
        currentPath: scanEvent.data.currentPath,
      };
    case "finished":
      return {
        ...state,
        status: "finished",
        summary: scanEvent.data,
        directoriesVisited: scanEvent.data.directoriesVisited,
        currentPath: "",
      };
  }
}

function removeEntries(state: ScanState, paths: readonly string[]): ScanState {
  const removed = new Set(paths);
  return { ...state, entries: state.entries.filter((entry) => !removed.has(entry.path)) };
}
