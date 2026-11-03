/**
 * The only module that talks to the Tauri backend. Components and hooks depend on
 * these functions, never on `invoke` directly, so the IPC surface lives in one place.
 */
import { Channel, invoke } from "@tauri-apps/api/core";
import { homeDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { revealItemInDir } from "@tauri-apps/plugin-opener";

import type { DeletionOutcome, ScanEvent } from "../types/nodeModules";

export async function scanNodeModules(
  root: string,
  onEvent: (event: ScanEvent) => void,
): Promise<void> {
  const channel = new Channel<ScanEvent>();
  channel.onmessage = onEvent;
  await invoke("scan_node_modules", { root, onEvent: channel });
}

export function cancelScan(): Promise<void> {
  return invoke("cancel_scan");
}

export function deleteNodeModules(paths: string[]): Promise<DeletionOutcome[]> {
  return invoke("delete_node_modules", { paths });
}

export function getHomeDirectory(): Promise<string> {
  return homeDir();
}

/** Returns the chosen folder, or `null` when the user closes the dialog. */
export async function pickDirectory(defaultPath: string): Promise<string | null> {
  const selected = await open({ directory: true, multiple: false, defaultPath });
  return typeof selected === "string" ? selected : null;
}

export function revealInFileManager(path: string): Promise<void> {
  return revealItemInDir(path);
}
