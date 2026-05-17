# Implementation Tasks

## Phase 1: Foundation — Dependency Installation

1. Install devDependencies with exact version pinning (`-D -E` per Biome docs): `@biomejs/biome`, `lefthook`, `@commitlint/cli`, `@commitlint/config-conventional`, `conventional-changelog`
2. Remove Prettier: uninstall `prettier` and delete `.prettierrc`

## Phase 2: Core Configuration

3. Create `biome.json` (official default from `biome init`) with:
   - `$schema` pointing to `https://biomejs.dev/schemas/2.4.13/schema.json`
   - `files.includes`: `["**", "!**/dist", "!**/.angular", "!!**/dist"]` — all files, exclude build output
   - `vcs`: enabled, git, useIgnoreFile, defaultBranch="main"
   - `formatter`: `indentStyle: "space"` (Biome default is `"tab"`), `indentWidth: 4`, `lineWidth: 120` (default 80), `lineEnding: "lf"`, `formatWithErrors: true`
   - `javascript.parser.unsafeParameterDecoratorsEnabled: true` (required for Angular DI)
   - `javascript.formatter`: `quoteStyle: "single"` (default is `"double"`), `semicolons: "always"`, `trailingCommas: "all"`
   - `json.parser`: `allowComments: true`, `allowTrailingCommas: true`
   - `linter.rules.recommended: true`, `suspicious.noExplicitAny: "off"`
   - `overrides`: test files (`*.spec.ts`, `*.test.ts`) relax `noNonNullAssertion`
4. Create `lefthook.yml` with:
   - `pre-commit` hook: `biome-format` (write + stage_fixed) and `biome-lint` (check only) commands sequentially
   - `commit-msg` hook: `commitlint --edit {1}` (uses Lefthook's `{1}` template, not shell `$1`)
5. Create `commitlint.config.ts` extending `@commitlint/config-conventional` with custom emoji-prefix rule per commit type

## Phase 3: Package.json Scripts

6. Add npm scripts to `package.json`:
   - `format`: `biome check --write .`
   - `format:check`: `biome check .`
   - `lint`: `biome lint .`
   - `ci`: `biome ci .`
   - `prepare`: `lefthook install`
   - `changelog`: `conventional-changelog -p angular`
   - `changelog:first`: `conventional-changelog -p angular -r 0`
   - `version`: `conventional-changelog -p angular && git add CHANGELOG.md`
7. Verify `prepare` script runs on `bun install`
8. Create `.npmrc` with `tag-version-prefix=""` and `message="chore(release): %s :tada:"` for automated release commit messages

## Phase 4: Integration & Cleanup

9. Run `biome check --write` on the entire codebase to normalize formatting
10. Verify all git hooks execute correctly (`lefthook run pre-commit`, `lefthook run commit-msg`)
11. Generate initial `CHANGELOG.md` via `bun run changelog:first` (uses `-r 0` for full history), review it, and commit
12. Update `.gitignore` if biome-specific artifacts need exclusion
13. Update `AGENTS.md` to reference Biome, Lefthook, and conventional-changelog as the project toolchain
14. Sync `.github/copilot-instructions.md` with `AGENTS.md` changes

## Phase 5: GitHub Actions CI/CD

15. Create `.github/workflows/ci.yml` with:
    - Trigger on `push` and `pull_request` to `main`
    - `quality` job: checkout → setup Bun 1.3.13 → `bun install --frozen-lockfile` → `bun biome ci .` → `bun tsc --noEmit`
    - `test` job: depends on `quality` → checkout → setup Bun → install → `bun run test`
16. Push the workflow and verify it executes on the PR
17. Ensure `bun.lockb` exists and is committed (required for `--frozen-lockfile` in CI)

## Phase 6: Validation

18. Run `biome check` — must pass with zero errors
19. Run `tsc --noEmit` — must pass (ensure Biome didn't break TypeScript)
20. Run existing tests (`bun run test`)
21. Test commit workflow end-to-end: stage a file, attempt commit, verify hooks execute
22. Verify `bun run changelog:first` generates valid CHANGELOG.md from all commit history
23. Test version workflow: `bun version patch` and verify `CHANGELOG.md` is regenerated, staged, and the release commit uses the `.npmrc` `message` template
24. Verify CI workflow passes all checks on GitHub Actions
