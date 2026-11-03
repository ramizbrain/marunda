use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex, MutexGuard, PoisonError};

/// Shared Tauri state that tracks the cancel flag of the scan currently running.
#[derive(Default)]
pub struct ScanRegistry {
    current: Mutex<Option<Arc<AtomicBool>>>,
}

impl ScanRegistry {
    /// Registers a new scan and returns its cancel flag. Starting a new scan
    /// cancels the previous one, so two walks never compete for the disk.
    pub fn begin(&self) -> Arc<AtomicBool> {
        let token = Arc::new(AtomicBool::new(false));
        if let Some(previous) = self.lock().replace(Arc::clone(&token)) {
            previous.store(true, Ordering::Relaxed);
        }
        token
    }

    /// Asks the running scan, if any, to stop.
    pub fn cancel(&self) {
        if let Some(token) = self.lock().as_ref() {
            token.store(true, Ordering::Relaxed);
        }
    }

    fn lock(&self) -> MutexGuard<'_, Option<Arc<AtomicBool>>> {
        // A poisoned flag holder is still usable: it only stores atomics.
        self.current.lock().unwrap_or_else(PoisonError::into_inner)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cancel_sets_the_running_scan_flag() {
        let registry = ScanRegistry::default();
        let token = registry.begin();

        registry.cancel();

        assert!(token.load(Ordering::Relaxed));
    }

    #[test]
    fn beginning_a_new_scan_cancels_the_previous_one() {
        let registry = ScanRegistry::default();
        let first = registry.begin();
        let second = registry.begin();

        assert!(first.load(Ordering::Relaxed));
        assert!(!second.load(Ordering::Relaxed));
    }
}
