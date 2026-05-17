# Proposal: Integrate DX Toolchain (Biome + Lefthook + Commitlint)

## Why

The project currently lacks automated code quality enforcement. There is no linting, no git hooks, and no commit message standards. Prettier is the only formatting tool, but it operates as a standalone dependency with no integration into the development workflow.

**Context**:
- Angular v21.2 project with Bun as package manager and Vitest for testing
- Only Prettier is configured for formatting; no ESLint or any linter exists
- No git hooks automation (no Husky, no Lefthook)
- No commit message validation or convention enforcement
- No staged-file checking before commits

**Current state**: Developers must manually run `prettier` to format code. There are no automated gates preventing commits that contain lint errors, incorrectly formatted code, or non-conventional commit messages. Each developer's editor/IDE may apply different formatting, leading to inconsistencies.

**Desired state**: A unified, automated DX toolchain that:
- Formats code (Biome replaces Prettier) and lints TypeScript/JSON/CSS/HTML via a single tool
- Enforces pre-commit quality gates via Lefthook (format + lint staged files)
- Validates commit messages follow Conventional Commits via Lefthook + Commitlint
- Provides npm scripts (`format`, `format:check`, `lint`) for manual use
- Ensures consistent code across editors, environments, and developers

## What Changes

- Remove `prettier` dependency and `.prettierrc` configuration
- Add `@biomejs/biome` as the unified formatter and linter
- Add `lefthook` for git hooks management
- Add `@commitlint/cli` and `@commitlint/config-conventional` for commit message validation
- Create `biome.jsonc` with rules appropriate for an Angular TypeScript project
- Create `lefthook.yml` with pre-commit (format + lint) and commit-msg hooks
- Create `commitlint.config.ts` with conventional commit configuration
- Add npm scripts: `format`, `format:check`, `lint`, `prepare`
- Update `.gitignore` if needed
- Update `AGENTS.md` and `openspec/config.yaml` context to reflect new toolchain

## Impact

### Affected Specifications
- `openspec/specs/developer-experience/spec.md` - New capability: DX toolchain enforcement

### Affected Code
- Root configuration files: `.prettierrc` (removed), `biome.jsonc` (new), `lefthook.yml` (new), `commitlint.config.ts` (new)
- `package.json` - dependency changes and new scripts
- `.gitignore` - may need to ignore `.prettierrc` or biome-specific artifacts
- `AGENTS.md` and `.github/copilot-instructions.md` - tooling references

### User Impact
- Developers must install lefthook after clone (`bun run prepare` or `lefthook install`)
- Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) format
- Staged files are auto-formatted and linted on commit; commits are blocked on lint errors

### Team Impact
- Requires `lefthook install` on each developer's machine (automated via `prepare` script)
- Requires awareness of conventional commit format (`type(scope): description`)
- Consistent formatting enforced; no more "format on save" discrepancies between editors

### Migration Required
- [x] Remove `.prettierrc` and `prettier` dependency
- [x] Run `biome check --write` once on entire codebase to normalize formatting
- [x] Run `lefthook install` to activate git hooks
- [x] Update CI pipeline if any (currently none)

## Timeline Estimate

**Small** — Approximately 1-2 hours. Configuration-only change with no application code modifications.

## Risks

- **Biome HTML formatter differences**: Biome v2.4+ HTML formatter changed significantly; Angular component templates may produce larger-than-expected diffs on first format. Mitigation: review diffs carefully and adjust Biome rules if needed.
- **Biome rule false positives**: Some Biome lint rules may flag Angular-specific patterns (decorators, dependency injection). Mitigation: configure Biome overrides for Angular-specific patterns, disable conflicting rules.
- **Lefthook installation**: Developers must remember to run `lefthook install` after clone. Mitigation: automate via `prepare` lifecycle script in `package.json`.
