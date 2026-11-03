import { useCallback, useReducer, useRef } from "react";

import { cancelScan, scanNodeModules } from "../services/marundaApi";
import { toErrorMessage } from "../lib/errors";
import { initialScanState, scanReducer } from "./scanReducer";

/** Runs scans and keeps the list of found `node_modules` folders. */
export function useNodeModulesScan() {
  const [state, dispatch] = useReducer(scanReducer, initialScanState);
  // Events from a scan that has been superseded by a newer one are ignored.
  const latestScanId = useRef(0);

  const startScan = useCallback(async (root: string) => {
    const scanId = ++latestScanId.current;
    const isCurrent = () => scanId === latestScanId.current;

    dispatch({ type: "started" });
    try {
      await scanNodeModules(root, (event) => {
        if (isCurrent()) dispatch({ type: "eventReceived", event });
      });
    } catch (error) {
      if (isCurrent()) dispatch({ type: "failed", message: toErrorMessage(error) });
    }
  }, []);

  const stopScan = useCallback(() => cancelScan(), []);

  const removeEntries = useCallback((paths: readonly string[]) => {
    dispatch({ type: "entriesRemoved", paths });
  }, []);

  return { ...state, startScan, stopScan, removeEntries };
}
