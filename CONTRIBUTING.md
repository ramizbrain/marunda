# Contributing to Marunda

Thanks for helping make Marunda better! This guide covers how to set up the project and
what a pull request needs before it can be merged.

## Getting started

1. Install the prerequisites listed in the [README](README.md#prerequisites).
2. Fork and clone the repository, then run:

   ```bash
   pnpm install
   pnpm tauri dev
   ```

## Before you open a pull request

Every one of these should pass:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:rust
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo fmt --manifest-path src-tauri/Cargo.toml --check
```

## Guidelines

- **Keep the layers separate.** File-system logic belongs in `scanner.rs`, `disk_usage.rs`, or
  `cleaner.rs`, never in `commands.rs`. Frontend code reaches the backend only through
  `src/services/marundaApi.ts`.
- **Change the contract on both sides.** If you change a struct in `src-tauri/src/models.rs`,
  update `src/types/nodeModules.ts` and the contract tests in `models.rs` in the same pull request.
- **Never weaken the deletion guard rails.** Anything that touches `cleaner.rs` needs tests
  that prove only real `node_modules` folders can be removed.
- **Test behaviour, not implementation.** Rust tests use real temporary folders (`tempfile`).
  Frontend tests use Testing Library and mock only `marundaApi`.
- **Small, focused pull requests** are easier to review. Explain *why* in the description,
  and add a screenshot for UI changes.

## Reporting bugs

Please include your OS and version, how you installed Marunda, what you expected, and what
happened instead. If a size looks wrong, compare it with `du -sh <path>/node_modules` and
include both numbers.

## Brand assets

The logo and icon live in [`docs/assets/brand/`](docs/assets/brand). Use the `*-on-dark`
variants on dark backgrounds and the `*-on-light` variants on light ones. Please don't modify
or recolor them. The app icons in `src-tauri/icons/` are generated from
`docs/assets/brand/app-icon.png` with `pnpm tauri icon`.
