use std::fs::Metadata;
use std::path::Path;

use walkdir::WalkDir;

/// Total bytes a directory occupies on disk, i.e. roughly what deleting it frees.
/// Symlinks are not followed, hard-linked files are counted once (like `du`), and
/// unreadable entries are skipped instead of failing the whole calculation.
pub fn directory_size(path: &Path) -> u64 {
    let mut hard_links = HardLinkTracker::default();

    WalkDir::new(path)
        .follow_links(false)
        .into_iter()
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().is_file())
        .filter_map(|entry| entry.metadata().ok())
        .filter(|metadata| hard_links.is_first_sighting(metadata))
        .map(|metadata| bytes_on_disk(&metadata))
        .sum()
}

/// Allocated blocks are what deletion actually frees on Unix; that is more
/// honest than the apparent length for sparse or tiny files.
#[cfg(unix)]
fn bytes_on_disk(metadata: &Metadata) -> u64 {
    use std::os::unix::fs::MetadataExt;
    const BLOCK_SIZE: u64 = 512;
    metadata.blocks() * BLOCK_SIZE
}

#[cfg(not(unix))]
fn bytes_on_disk(metadata: &Metadata) -> u64 {
    metadata.len()
}

/// Packages often hard-link the same binary twice (e.g. `esbuild` and
/// `@esbuild/<platform>`); the data exists once, so it must be counted once.
#[derive(Default)]
struct HardLinkTracker {
    #[cfg(unix)]
    seen: std::collections::HashSet<(u64, u64)>,
}

impl HardLinkTracker {
    #[cfg(unix)]
    fn is_first_sighting(&mut self, metadata: &Metadata) -> bool {
        use std::os::unix::fs::MetadataExt;
        metadata.nlink() <= 1 || self.seen.insert((metadata.dev(), metadata.ino()))
    }

    #[cfg(not(unix))]
    fn is_first_sighting(&mut self, _metadata: &Metadata) -> bool {
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    #[test]
    fn empty_directory_has_zero_size() {
        let dir = tempfile::tempdir().unwrap();
        assert_eq!(directory_size(dir.path()), 0);
    }

    #[test]
    fn counts_files_in_nested_directories() {
        let dir = tempfile::tempdir().unwrap();
        let nested = dir.path().join("a/b");
        fs::create_dir_all(&nested).unwrap();
        fs::write(dir.path().join("top.txt"), vec![1u8; 10_000]).unwrap();
        fs::write(nested.join("deep.txt"), vec![1u8; 10_000]).unwrap();

        assert!(directory_size(dir.path()) >= 20_000);
    }

    #[cfg(unix)]
    #[test]
    fn counts_hard_linked_files_once() {
        let dir = tempfile::tempdir().unwrap();
        let original = dir.path().join("esbuild");
        fs::write(&original, vec![1u8; 100_000]).unwrap();
        let size_of_one_copy = directory_size(dir.path());

        fs::hard_link(&original, dir.path().join("esbuild-link")).unwrap();

        assert_eq!(directory_size(dir.path()), size_of_one_copy);
    }
}
