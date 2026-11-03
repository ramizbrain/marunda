import { AnimatePresence, LayoutGroup, MotionConfig } from "motion/react";
import { useCallback, useState } from "react";

import { DashboardScreen } from "./components/dashboard/DashboardScreen";
import { Backdrop } from "./components/motion/Backdrop";
import { ScanningScreen } from "./components/scanning/ScanningScreen";
import { WelcomeScreen } from "./components/welcome/WelcomeScreen";
import { useNodeModulesDeletion } from "./hooks/useNodeModulesDeletion";
import { useNodeModulesScan } from "./hooks/useNodeModulesScan";
import { useScanRoot } from "./hooks/useScanRoot";
import { useSelection } from "./hooks/useSelection";
import { shortenPath } from "./lib/format";
import { phaseAfterScan } from "./lib/phase";
import type { Phase } from "./lib/phase";
import { revealInFileManager } from "./services/marundaApi";

export default function App() {
  const { root, homeDirectory, chooseRoot } = useScanRoot();
  const scan = useNodeModulesScan();
  const selection = useSelection();
  const [phase, setPhase] = useState<Phase>("welcome");

  const { removeEntries } = scan;
  const { deselect } = selection;
  const handleDeleted = useCallback(
    (paths: string[]) => {
      removeEntries(paths);
      deselect(paths);
    },
    [removeEntries, deselect],
  );
  const deletion = useNodeModulesDeletion(handleDeleted);

  const startScan = () => {
    selection.clear();
    deletion.dismissReport();
    setPhase("scanning");
    void scan.startScan(root);
  };

  const { status, summary, entries } = scan;
  const finishScanning = useCallback(
    () => setPhase(phaseAfterScan(status, summary, entries.length)),
    [status, summary, entries.length],
  );

  const displayRoot = shortenPath(root, homeDirectory);

  return (
    // Users who ask their OS for reduced motion get fades instead of movement.
    <MotionConfig reducedMotion="user">
      <div className="app">
        <Backdrop phase={phase} />
        <LayoutGroup>
          <AnimatePresence>
            {phase === "welcome" && (
              <WelcomeScreen
                key="welcome"
                displayRoot={displayRoot}
                canScan={root !== ""}
                error={scan.status === "error" ? scan.error : null}
                onScan={startScan}
                onChooseRoot={() => void chooseRoot()}
              />
            )}
            {phase === "scanning" && (
              <ScanningScreen
                key="scanning"
                status={scan.status}
                entries={scan.entries}
                directoriesVisited={scan.directoriesVisited}
                currentPath={scan.currentPath}
                summary={scan.summary}
                onCancel={() => void scan.stopScan()}
                onOutroComplete={finishScanning}
              />
            )}
            {phase === "dashboard" && (
              <DashboardScreen
                key="dashboard"
                entries={scan.entries}
                summary={scan.summary}
                displayRoot={displayRoot}
                homeDirectory={homeDirectory}
                selection={selection}
                deletion={deletion}
                onHome={() => setPhase("welcome")}
                onChooseRoot={() => void chooseRoot()}
                onRescan={startScan}
                onReveal={(path) => void revealInFileManager(path)}
              />
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </MotionConfig>
  );
}
