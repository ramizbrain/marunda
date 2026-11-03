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

## Commit messages and versioning

Marunda follows [Semantic Versioning](https://semver.org), and the version number and
[CHANGELOG.md](CHANGELOG.md) are generated from commit messages. Please write commits (and
pull request titles, since pull requests are squash-merged) as
[Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<optional scope>): <short summary>
```

| Type | Use it for | Version bump | In the changelog |
| --- | --- | --- | --- |
| `feat` | a new user-facing feature | minor | Features |
| `fix` | a bug fix | patch | Bug Fixes |
| `perf` | a performance improvement | patch | Performance |
| `docs` | documentation only | none | Documentation |
| `refactor`, `test`, `build`, `ci`, `style`, `chore` | everything else | none | hidden |

A breaking change is marked with `!` after the type (`feat!: drop Windows 7 support`) or a
`BREAKING CHANGE:` footer. While Marunda is below 1.0.0, a breaking change bumps the minor
version instead of the major one.

Examples:

```
feat(scanner): skip folders listed in .marundaignore
fix(cleaner): refuse to delete a node_modules that is a symlink
docs: explain the "Open Anyway" step for macOS
```

## How releases work

You don't need to bump versions by hand. On every push to `main`,
[release-please](https://github.com/googleapis/release-please) updates a pull request titled
`chore(main): release x.y.z` with the next version and the changelog entry. When a maintainer
merges it, the release workflow tags `vX.Y.Z`, publishes a GitHub Release, and attaches the
macOS, Windows, and Linux installers built by CI.

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
