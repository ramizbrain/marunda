use serde::Serialize;

/// A `node_modules` folder found during a scan.
#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct NodeModulesEntry {
    /// Absolute path to the `node_modules` folder itself.
    pub path: String,
    /// Absolute path to the project that owns the folder.
    pub project_path: String,
    /// Display name of the project (its folder name).
    pub project_name: String,
    /// Bytes on disk that deleting this folder would free.
    pub size_bytes: u64,
    /// When `node_modules` was last modified (roughly: the last install), in Unix ms.
    pub last_modified_ms: Option<u64>,
}

/// Messages streamed to the frontend while a scan runs.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
pub enum ScanEvent {
    #[serde(rename_all = "camelCase")]
    Found { entry: NodeModulesEntry },

    #[serde(rename_all = "camelCase")]
    Progress {
        directories_visited: u64,
        current_path: String,
    },

    /// ScanSummary already serializes its own fields in camelCase.
    Finished(ScanSummary),
}

/// Final tally of a scan.
#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ScanSummary {
    pub total_found: usize,
    pub total_bytes: u64,
    pub directories_visited: u64,
    pub cancelled: bool,
    pub duration_ms: u64,
}

/// Result of deleting one `node_modules` folder.
#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct DeletionOutcome {
    pub path: String,
    pub success: bool,
    pub error: Option<String>,
}

/// These tests pin the JSON shape that `src/types/nodeModules.ts` relies on.
#[cfg(test)]
mod contract_tests {
    use super::*;
    use serde_json::json;

    fn entry() -> NodeModulesEntry {
        NodeModulesEntry {
            path: "/p/app/node_modules".into(),
            project_path: "/p/app".into(),
            project_name: "app".into(),
            size_bytes: 42,
            last_modified_ms: None,
        }
    }

    #[test]
    fn found_event_shape() {
        let value = serde_json::to_value(ScanEvent::Found { entry: entry() }).unwrap();
        assert_eq!(
            value,
            json!({
                "event": "found",
                "data": { "entry": {
                    "path": "/p/app/node_modules",
                    "projectPath": "/p/app",
                    "projectName": "app",
                    "sizeBytes": 42,
                    "lastModifiedMs": null
                }}
            })
        );
    }

    #[test]
    fn progress_event_shape() {
        let event = ScanEvent::Progress {
            directories_visited: 250,
            current_path: "/p".into(),
        };
        assert_eq!(
            serde_json::to_value(event).unwrap(),
            json!({ "event": "progress", "data": { "directoriesVisited": 250, "currentPath": "/p" } })
        );
    }

    #[test]
    fn finished_event_shape() {
        let event = ScanEvent::Finished(ScanSummary {
            total_found: 1,
            total_bytes: 42,
            directories_visited: 9,
            cancelled: false,
            duration_ms: 5,
        });
        assert_eq!(
            serde_json::to_value(event).unwrap(),
            json!({ "event": "finished", "data": {
                "totalFound": 1, "totalBytes": 42, "directoriesVisited": 9, "cancelled": false, "durationMs": 5
            }})
        );
    }
}
