//! Thin IPC layer: validates input, moves blocking work off the async runtime,
//! and delegates to the domain modules.

use std::path::{Path, PathBuf};

use tauri::State;
use tauri::async_runtime::spawn_blocking;
use tauri::ipc::Channel;

use crate::cleaner;
use crate::error::{AppError, AppResult};
use crate::models::{DeletionOutcome, ScanEvent};
use crate::scan_registry::ScanRegistry;
use crate::scanner;

#[tauri::command]
pub async fn scan_node_modules(
    root: String,
    on_event: Channel<ScanEvent>,
    registry: State<'_, ScanRegistry>,
) -> AppResult<()> {
    let root = PathBuf::from(root);
    ensure_scannable(&root)?;
    let cancel = registry.begin();

    spawn_blocking(move || {
        // A failed send only means the window went away; the scan can just finish.
        let summary = scanner::scan(&root, &cancel, |event| {
            let _ = on_event.send(event);
        });
        let _ = on_event.send(ScanEvent::Finished(summary));
    })
    .await
    .map_err(|error| AppError::Task(error.to_string()))
}

#[tauri::command]
pub fn cancel_scan(registry: State<'_, ScanRegistry>) {
    registry.cancel();
}

#[tauri::command]
pub async fn delete_node_modules(paths: Vec<String>) -> AppResult<Vec<DeletionOutcome>> {
    spawn_blocking(move || cleaner::delete_all(&paths))
        .await
        .map_err(|error| AppError::Task(error.to_string()))
}

fn ensure_scannable(root: &Path) -> AppResult<()> {
    if !root.exists() {
        return Err(AppError::RootNotFound(root.display().to_string()));
    }
    if !root.is_dir() {
        return Err(AppError::RootNotDirectory(root.display().to_string()));
    }
    Ok(())
}
