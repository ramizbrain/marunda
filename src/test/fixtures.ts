import type { NodeModulesEntry } from "../types/nodeModules";

export function makeEntry(overrides: Partial<NodeModulesEntry> = {}): NodeModulesEntry {
  const projectName = overrides.projectName ?? "app";
  const projectPath = overrides.projectPath ?? `/home/me/code/${projectName}`;
  return {
    path: `${projectPath}/node_modules`,
    projectPath,
    projectName,
    sizeBytes: 1024,
    lastModifiedMs: 0,
    ...overrides,
  };
}
