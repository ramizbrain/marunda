mod cleaner;
mod commands;
mod disk_usage;
mod error;
mod models;
mod scan_registry;
mod scanner;

use scan_registry::ScanRegistry;
use tauri::{Builder, Runtime};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    with_marunda_backend(Builder::default())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running Marunda");
}

/// State and commands that make up Marunda's backend. Shared by the real app and
/// the IPC tests, so the tests exercise exactly what the frontend talks to.
fn with_marunda_backend<R: Runtime>(builder: Builder<R>) -> Builder<R> {
    builder
        .manage(ScanRegistry::default())
        .invoke_handler(tauri::generate_handler![
            commands::scan_node_modules,
            commands::cancel_scan,
            commands::delete_node_modules,
        ])
}

#[cfg(test)]
mod ipc_tests {
    use std::fs;
    use std::path::Path;

    use serde_json::{Value, json};
    use tauri::ipc::{CallbackFn, InvokeBody};
    use tauri::test::{
        INVOKE_KEY, MockRuntime, get_ipc_response, mock_builder, mock_context, noop_assets,
    };
    use tauri::webview::InvokeRequest;
    use tauri::{WebviewWindow, WebviewWindowBuilder};

    use super::with_marunda_backend;

    fn mock_window() -> WebviewWindow<MockRuntime> {
        let app = with_marunda_backend(mock_builder())
            .build(mock_context(noop_assets()))
            .unwrap();
        WebviewWindowBuilder::new(&app, "main", Default::default())
            .build()
            .unwrap()
    }

    /// Sends a command the same way `invoke(cmd, args)` does from the frontend.
    fn invoke(window: &WebviewWindow<MockRuntime>, cmd: &str, args: Value) -> Result<Value, Value> {
        get_ipc_response(
            window,
            InvokeRequest {
                cmd: cmd.into(),
                callback: CallbackFn(0),
                error: CallbackFn(1),
                url: "tauri://localhost".parse().unwrap(),
                body: InvokeBody::Json(args),
                headers: Default::default(),
                invoke_key: INVOKE_KEY.to_string(),
            },
        )
        .map(|body| body.deserialize::<Value>().unwrap())
    }

    fn make_node_modules(root: &Path, project: &str) -> String {
        let node_modules = root.join(project).join("node_modules");
        fs::create_dir_all(node_modules.join("left-pad")).unwrap();
        fs::write(node_modules.join("left-pad/index.js"), "module.exports = 1").unwrap();
        node_modules.display().to_string()
    }

    #[test]
    fn delete_command_removes_node_modules_and_refuses_other_folders() {
        let root = tempfile::tempdir().unwrap();
        let node_modules = make_node_modules(root.path(), "app");
        let source = root.path().join("app/src");
        fs::create_dir_all(&source).unwrap();

        let response = invoke(
            &mock_window(),
            "delete_node_modules",
            json!({ "paths": [node_modules, source.display().to_string()] }),
        )
        .unwrap();

        assert_eq!(
            response[0],
            json!({ "path": node_modules, "success": true, "error": null })
        );
        assert_eq!(response[1]["success"], json!(false));
        assert!(!Path::new(&node_modules).exists());
        assert!(
            source.exists(),
            "non-node_modules folders must never be deleted"
        );
    }

    #[test]
    fn scan_command_accepts_a_channel_and_completes() {
        let root = tempfile::tempdir().unwrap();
        make_node_modules(root.path(), "app");

        let response = invoke(
            &mock_window(),
            "scan_node_modules",
            json!({ "root": root.path().display().to_string(), "onEvent": "__CHANNEL__:1" }),
        );

        assert_eq!(response, Ok(Value::Null));
    }

    #[test]
    fn scan_command_rejects_a_missing_root_with_a_readable_message() {
        let response = invoke(
            &mock_window(),
            "scan_node_modules",
            json!({ "root": "/definitely/not/here", "onEvent": "__CHANNEL__:1" }),
        );

        assert_eq!(
            response,
            Err(json!("Folder not found: /definitely/not/here"))
        );
    }

    #[test]
    fn cancel_command_is_callable_without_a_running_scan() {
        assert_eq!(
            invoke(&mock_window(), "cancel_scan", json!({})),
            Ok(Value::Null)
        );
    }
}
