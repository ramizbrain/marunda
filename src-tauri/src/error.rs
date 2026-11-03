use serde::{Serialize, Serializer};

/// Every failure that can cross the IPC boundary to the frontend.
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Folder not found: {0}")]
    RootNotFound(String),

    #[error("Not a folder: {0}")]
    RootNotDirectory(String),

    #[error("Only folders named node_modules can be deleted: {0}")]
    NotNodeModules(String),

    #[error("Refusing to delete a symlink: {0}")]
    SymlinkRefused(String),

    #[error("File system error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Background task failed: {0}")]
    Task(String),
}

/// Tauri needs command errors to be serializable; the frontend only needs the message.
impl Serialize for AppError {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;
