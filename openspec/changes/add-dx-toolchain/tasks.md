# Implementation Tasks

## Phase 1: Foundation — Dependency Installation

- [x] 1. Install devDependencies with exact version pinning (`-D -E` per Biome docs): `@biomejs/biome`, `lefthook`, `@commitlint/cli`, `@commitlint/config-conventional`, `conventional-changelog`
- [x] 2. Remove Prettier: uninstall `prettier` and delete `.prettierrc`

## Phase 2: Core Configuration

- [x] 3. Create `biome.json` (official default from `biome init`) with Angular/TypeScript-appropriate rules
- [x] 4. Create `lefthook.yml` with pre-commit (biome format + lint with stage_fixed) and commit-msg (commitlint) hooks
- [x] 5. Create `commitlint.config.ts` extending `@commitlint/config-conventional` with custom emoji-prefix rule per commit type

## Phase 3: Package.json Scripts

- [x] 6. Add npm scripts: `format`, `format:check`, `lint`, `ci`, `prepare`, `changelog`, `changelog:first`, `version`
- [x] 7. Verify `prepare` script runs on `bun install`
- [x] 8. Create `.npmrc` with release configuration

## Phase 4: Integration & Cleanup

- [x] 9. Run `biome check --write` on the entire codebase to normalize formatting
- [x] 10. Verify all git hooks execute correctly
- [x] 11. Generate initial `CHANGELOG.md` and commit it
- [x] 12. Update `.gitignore` if biome-specific artifacts need exclusion
- [x] 13. Update `AGENTS.md` to reference new toolchain
- [x] 14. Sync `.github/copilot-instructions.md` with `AGENTS.md` changes

## Phase 5: GitHub Actions CI/CD

- [x] 15. Create `.github/workflows/ci.yml` with quality and test jobs
- [x] 16. Push the workflow and verify it executes (remote created, CI triggers on push to main)
- [ ] 23. Test version workflow: `bun version patch` (requires tag to verify end-to-end)
- [ ] 24. Verify CI workflow passes all checks on GitHub Actions (running on push)
