use std::fs;
use std::path::Path;

use crate::error::{AppError, AppResult};
use crate::models::DeletionOutcome;
use crate::scanner::NODE_MODULES;

/// Deletes every given folder independently, so one failure never blocks the rest.
pub fn delete_all(paths: &[String]) -> Vec<DeletionOutcome> {
    paths
        .iter()
        .map(|path| match delete_node_modules(Path::new(path)) {
            Ok(()) => DeletionOutcome {
                path: path.clone(),
                success: true,
                error: None,
            },
            Err(error) => DeletionOutcome {
                path: path.clone(),
                success: false,
                error: Some(error.to_string()),
            },
        })
        .collect()
}

/// Permanently deletes a `node_modules` folder after checking that it really is one.
pub fn delete_node_modules(path: &Path) -> AppResult<()> {
    ensure_deletable(path)?;
    fs::remove_dir_all(path)?;
    Ok(())
}

/// Guard rails: only real (non-symlink) folders named `node_modules` may be removed.
fn ensure_deletable(path: &Path) -> AppResult<()> {
    let display = || path.display().to_string();

    if path.file_name().is_none_or(|name| name != NODE_MODULES) {
        return Err(AppError::NotNodeModules(display()));
    }

    let metadata = fs::symlink_metadata(path)?;
    if metadata.file_type().is_symlink() {
        return Err(AppError::SymlinkRefused(display()));
    }
    if !metadata.is_dir() {
        return Err(AppError::NotNodeModules(display()));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn deletes_a_node_modules_folder() {
        let root = tempfile::tempdir().unwrap();
        let target = root.path().join("app/node_modules/pkg");
        fs::create_dir_all(&target).unwrap();
        fs::write(target.join("index.js"), "module.exports = 1").unwrap();

        delete_node_modules(&root.path().join("app/node_modules")).unwrap();

        assert!(!root.path().join("app/node_modules").exists());
        assert!(root.path().join("app").exists());
    }

    #[test]
    fn refuses_folders_with_another_name() {
        let root = tempfile::tempdir().unwrap();
        let src = root.path().join("src");
        fs::create_dir_all(&src).unwrap();

        let result = delete_node_modules(&src);

        assert!(matches!(result, Err(AppError::NotNodeModules(_))));
        assert!(src.exists());
    }

    #[cfg(unix)]
    #[test]
    fn refuses_symlinked_node_modules() {
        let root = tempfile::tempdir().unwrap();
        let real = root.path().join("real");
        fs::create_dir_all(&real).unwrap();
        let link = root.path().join("node_modules");
        std::os::unix::fs::symlink(&real, &link).unwrap();

        let result = delete_node_modules(&link);

        assert!(matches!(result, Err(AppError::SymlinkRefused(_))));
        assert!(real.exists());
    }

    #[test]
    fn reports_each_path_independently() {
        let root = tempfile::tempdir().unwrap();
        let good = root.path().join("a/node_modules");
        fs::create_dir_all(&good).unwrap();
        let missing = root.path().join("b/node_modules");

        let outcomes = delete_all(&[good.display().to_string(), missing.display().to_string()]);

        assert!(outcomes[0].success);
        assert!(!outcomes[1].success);
        assert!(outcomes[1].error.is_some());
    }
}
