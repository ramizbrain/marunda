use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Instant, UNIX_EPOCH};

use walkdir::{DirEntry, WalkDir};

use crate::disk_usage::directory_size;
use crate::models::{NodeModulesEntry, ScanEvent, ScanSummary};

pub const NODE_MODULES: &str = "node_modules";

/// Folders that are never projects but are huge to walk (system caches, OS metadata).
const IGNORED_DIR_NAMES: &[&str] = &[
    "Library",
    "AppData",
    "$RECYCLE.BIN",
    "System Volume Information",
];

/// How many directories to visit between two progress events.
const PROGRESS_EVERY_N_DIRECTORIES: u64 = 250;

/// Walks `root` looking for `node_modules` folders and reports each one through
/// `on_event` as soon as it has been measured.
///
/// The walk never descends into a `node_modules` folder (nested ones belong to the
/// outer one), skips hidden and system folders, and stops early once `cancel` is set.
pub fn scan(root: &Path, cancel: &AtomicBool, mut on_event: impl FnMut(ScanEvent)) -> ScanSummary {
    let started_at = Instant::now();
    let mut summary = ScanSummary {
        total_found: 0,
        total_bytes: 0,
        directories_visited: 0,
        cancelled: false,
        duration_ms: 0,
    };

    let mut walker = WalkDir::new(root).follow_links(false).into_iter();

    while let Some(next) = walker.next() {
        if cancel.load(Ordering::Relaxed) {
            summary.cancelled = true;
            break;
        }

        // Permission errors and races with deleted files are expected; skip them.
        let Ok(dir_entry) = next else { continue };
        if !dir_entry.file_type().is_dir() {
            continue;
        }

        summary.directories_visited += 1;
        if summary
            .directories_visited
            .is_multiple_of(PROGRESS_EVERY_N_DIRECTORIES)
        {
            on_event(ScanEvent::Progress {
                directories_visited: summary.directories_visited,
                current_path: dir_entry.path().display().to_string(),
            });
        }

        if is_node_modules(&dir_entry) {
            walker.skip_current_dir();
            let entry = measure_node_modules(dir_entry.path());
            summary.total_found += 1;
            summary.total_bytes += entry.size_bytes;
            on_event(ScanEvent::Found { entry });
        } else if should_skip(&dir_entry) {
            walker.skip_current_dir();
        }
    }

    summary.duration_ms = elapsed_ms(started_at);
    summary
}

fn is_node_modules(dir_entry: &DirEntry) -> bool {
    dir_entry.file_name() == NODE_MODULES
}

/// The root itself is always walked, even when it is a hidden folder.
fn should_skip(dir_entry: &DirEntry) -> bool {
    if dir_entry.depth() == 0 {
        return false;
    }
    let name = dir_entry.file_name().to_string_lossy();
    name.starts_with('.') || IGNORED_DIR_NAMES.iter().any(|ignored| *ignored == name)
}

fn measure_node_modules(path: &Path) -> NodeModulesEntry {
    let project_dir = path.parent().unwrap_or(path);
    let project_name = project_dir
        .file_name()
        .map(|name| name.to_string_lossy().into_owned())
        .unwrap_or_else(|| project_dir.display().to_string());

    NodeModulesEntry {
        path: path.display().to_string(),
        project_path: project_dir.display().to_string(),
        project_name,
        size_bytes: directory_size(path),
        last_modified_ms: last_modified_ms(path),
    }
}

fn last_modified_ms(path: &Path) -> Option<u64> {
    let modified = path.metadata().ok()?.modified().ok()?;
    let since_epoch = modified.duration_since(UNIX_EPOCH).ok()?;
    u64::try_from(since_epoch.as_millis()).ok()
}

fn elapsed_ms(started_at: Instant) -> u64 {
    u64::try_from(started_at.elapsed().as_millis()).unwrap_or(u64::MAX)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;

    fn make_project(root: &Path, relative: &str, package_bytes: usize) -> PathBuf {
        let package_dir = root.join(relative).join("node_modules/some-package");
        fs::create_dir_all(&package_dir).unwrap();
        fs::write(package_dir.join("index.js"), vec![b'x'; package_bytes]).unwrap();
        root.join(relative).join("node_modules")
    }

    fn found_paths(root: &Path) -> Vec<String> {
        let mut paths = Vec::new();
        scan(root, &AtomicBool::new(false), |event| {
            if let ScanEvent::Found { entry } = event {
                paths.push(entry.path);
            }
        });
        paths.sort();
        paths
    }

    #[test]
    fn finds_node_modules_in_every_project() {
        let root = tempfile::tempdir().unwrap();
        let web = make_project(root.path(), "web", 4_096);
        let api = make_project(root.path(), "work/api", 4_096);

        let mut expected = vec![web.display().to_string(), api.display().to_string()];
        expected.sort();
        assert_eq!(found_paths(root.path()), expected);
    }

    #[test]
    fn does_not_report_nested_node_modules() {
        let root = tempfile::tempdir().unwrap();
        let outer = make_project(root.path(), "app", 1_024);
        fs::create_dir_all(outer.join("dep/node_modules/inner")).unwrap();

        assert_eq!(found_paths(root.path()), vec![outer.display().to_string()]);
    }

    #[test]
    fn skips_hidden_and_system_folders() {
        let root = tempfile::tempdir().unwrap();
        make_project(root.path(), ".cache/tool", 1_024);
        make_project(root.path(), "Library/stuff", 1_024);
        let visible = make_project(root.path(), "code/site", 1_024);

        assert_eq!(
            found_paths(root.path()),
            vec![visible.display().to_string()]
        );
    }

    #[test]
    fn reports_project_details_and_summary() {
        let root = tempfile::tempdir().unwrap();
        make_project(root.path(), "shop", 8_192);

        let mut found = Vec::new();
        let summary = scan(root.path(), &AtomicBool::new(false), |event| {
            if let ScanEvent::Found { entry } = event {
                found.push(entry);
            }
        });

        let entry = &found[0];
        assert_eq!(entry.project_name, "shop");
        assert_eq!(
            entry.project_path,
            root.path().join("shop").display().to_string()
        );
        assert!(entry.size_bytes >= 8_192);
        assert!(entry.last_modified_ms.is_some());
        assert_eq!(summary.total_found, 1);
        assert_eq!(summary.total_bytes, entry.size_bytes);
        assert!(!summary.cancelled);
    }

    /// Read-only smoke test against a real folder on this machine:
    /// `MARUNDA_SCAN_ROOT=~/code cargo test real_folder -- --ignored --nocapture`
    #[test]
    #[ignore = "scans a real folder from MARUNDA_SCAN_ROOT"]
    fn real_folder_smoke_test() {
        let root = std::env::var("MARUNDA_SCAN_ROOT").expect("set MARUNDA_SCAN_ROOT");
        let summary = scan(Path::new(&root), &AtomicBool::new(false), |event| {
            if let ScanEvent::Found { entry } = event {
                println!("{:>12} bytes  {}", entry.size_bytes, entry.path);
            }
        });
        println!("{summary:?}");
    }

    #[test]
    fn stops_immediately_when_cancelled() {
        let root = tempfile::tempdir().unwrap();
        make_project(root.path(), "app", 1_024);

        let summary = scan(root.path(), &AtomicBool::new(true), |_| {});

        assert!(summary.cancelled);
        assert_eq!(summary.total_found, 0);
    }
}
