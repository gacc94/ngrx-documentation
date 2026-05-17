## Context

The project has no automated code quality enforcement. Prettier exists as a standalone dependency but is not integrated into the git workflow. There are no git hooks, no pre-commit validation, and no commit message standards. This leads to inconsistent formatting and potential quality issues across contributors.

**Current tooling**:
- Bun 1.3.13 as package manager
- Vitest 4.x for testing
- Prettier 3.x with 100 print width and single quotes
- `.editorconfig` with 2-space indent
- Angular 21.2 with TypeScript 5.9
- SCSS for styling, HTML for templates

**Constraints**:
- Must use Bun as the runtime for all tooling commands
- Must not break existing Angular build (`ng build`) or tests (`ng test`)
- Must maintain compatibility with VS Code Biome extension for in-editor formatting
- Must work on macOS (current dev environment) and Linux (CI)

## Goals / Non-Goals

**Goals:**
- Replace Prettier with Biome as the unified formatter and linter
- Enforce 4-space indentation and 120-character print width across all files (TS, HTML, SCSS, JS, JSON, JSONC)
- Set up Lefthook pre-commit hooks that: (1) lint staged files, (2) auto-fix applicable issues with Biome, (3) re-stage the fixed files so commits always contain corrected code
- Enforce Conventional Commits via commitlint in a `commit-msg` Lefthook hook
- Extend commitlint with custom emoji-prefix rules: every conventional commit type (feat, fix, ci, docs, style, refactor, perf, test, chore, build, revert) must include its characteristic emoji
- Integrate `conventional-changelog` with Angular preset for automated CHANGELOG.md generation on releases (major, minor, patch)
- Provide npm scripts (`format`, `format:check`, `lint`, `ci`, `prepare`, `changelog`, `version`) for manual use
- Set up GitHub Actions CI/CD pipeline that runs Biome checks, TypeScript type-checking, and Vitest tests on every push/PR to main
- Relax lint rules for test files (`*.spec.ts`, `*.test.ts`)

**Non-Goals:**
- Custom ESLint rules or plugins (Biome's built-in linter suffices)
- Autofix for all lint rules (some rules only report, no autofix possible)
- Automated semantic release publishing (changelog generation is in scope, but npm publish / git tag automation is not)
- Reformatting of `.md` files (excluded from Biome formatting to avoid documentation churn)

## Decisions

### D1: 4-Space Indentation (overrides `.editorconfig` 2-space)

**Decision**: Use `indentWidth: 4` in Biome's formatter config and update `.editorconfig` accordingly.

**Rationale**: The team prefers wider indentation for readability in Angular templates with deeply nested elements and TypeScript with heavy decorator usage. The `.editorconfig` will be updated to `indent_size = 4` to stay in sync.

**Alternatives considered**:
- *Keep 2-space*: Angular CLI defaults to 2; conflicts with team preference.
- *Per-language indentation*: Would add complexity without clear benefit since the team wants 4-space everywhere.

### D2: 120 Print Width (up from 100)

**Decision**: Set `lineWidth: 120` in Biome formatter.

**Rationale**: Wider screens are standard; 120 chars allows Angular template lines (decorator chains, HTML attributes) to remain on one line more often, reducing unnecessary wrapping. Matches JetBrains and VS Code defaults.

**Alternatives considered**:
- *Keep 100*: Would create more line breaks in templates. Angular HTML attributes often exceed 100 chars when using `@if`, `@for`, class bindings, etc.

### D3: Lefthook pre-commit with re-staging

**Decision**: The `pre-commit` hook runs `biome check --write --no-errors-on-unmatched` on staged files, then `git add` re-stages any files Biome modified. This ensures committed code is always formatted.

**Workflow**:
```
git add <files>          # Developer stages changes
git commit -m "..."      # Lefthook pre-commit fires
  → biome check --write  # Formats + auto-fixes lint issues
  → git add <fixed files># Re-stage modified files
  → biome check          # Second pass: verify no remaining issues
commit proceeds           # Only if all checks pass
```

**Rationale**: Re-staging prevents the "formatted but unstaged" problem where Biome fixes code but the commit goes through with the original broken version. The second `biome check` pass ensures any non-auto-fixable lint errors block the commit.

**Alternatives considered**:
- *Single `biome check --write` without re-staging*: Would format files but commits would include unfixed code; the developer would need to manually re-add.
- *Husky + lint-staged*: Husky is Node.js-based and slower; lint-staged requires additional configuration. Lefthook is Rust-based, faster, and self-contained.

### D4: Conventional Commits with Emoji Prefix Rule

**Decision**: Create a custom commitlint plugin that extends `@commitlint/config-conventional` with an emoji requirement for each type.

**Mapping**:
| Type | Emoji | Example |
|------|-------|---------|
| `feat` | ✨ | `✨ feat: add user authentication` |
| `fix` | 🐛 | `🐛 fix: resolve race condition` |
| `ci` | 👷 | `👷 ci: add GitHub Actions workflow` |
| `docs` | 📝 | `📝 docs: update API reference` |
| `style` | 🎨 | `🎨 style: format with Biome` |
| `refactor` | ♻️ | `♻️ refactor: extract validator` |
| `perf` | ⚡ | `⚡ perf: optimize list rendering` |
| `test` | ✅ | `✅ test: add auth guard tests` |
| `chore` | 🔧 | `🔧 chore: update dependencies` |
| `build` | 📦 | `📦 build: update Angular to v21.3` |
| `revert` | ⏪ | `⏪ revert: rollback auth changes` |

**Implementation**: A custom commitlint rule that validates the emoji prefix matches the type. The emoji precedes the type and is separated by a space: `<emoji> <type>(<scope>): <description>`.

**Rationale**: Emoji prefixes make the git log visually scannable and align with common open-source conventions. The rule is an additional check on top of conventional commit format validation.

**Alternatives considered**:
- *Emoji after type* (`feat: ✨ description`): Non-standard; harder to parse.
- *No emoji rule*: Loses visual scannability benefit.

### D5: Biome Configuration Structure

**Decision**: Create `biome.json` (official default from `biome init`) at project root with v2.x configuration. The file uses JSON with comments support (Biome natively handles JSONC syntax in `.json` files). Includes `$schema` for editor auto-completion and validation.

**Complete `biome.json` structure**:

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.4.13/schema.json",
  "files": {
    "includes": ["**", "!**/dist", "!**/.angular", "!!**/dist"],
    "ignoreUnknown": true
  },
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 4,
    "lineWidth": 120,
    "lineEnding": "lf",
    "formatWithErrors": true,
    "useEditorconfig": false
  },
  "javascript": {
    "parser": {
      "unsafeParameterDecoratorsEnabled": true
    },
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always",
      "trailingCommas": "all"
    }
  },
  "json": {
    "parser": {
      "allowComments": true,
      "allowTrailingCommas": true
    }
  },
  "css": {
    "parser": {
      "cssModules": false
    }
  },
  "html": {
    "formatter": {
      "attributePosition": "auto"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "off"
      }
    }
  },
  "overrides": [
    {
      "includes": ["*.spec.ts", "*.test.ts"],
      "linter": {
        "rules": {
          "suspicious": {
            "noNonNullAssertion": "off"
          }
        }
      }
    }
  ]
}
```

**Key design decisions per official docs**:

| Option | Default (Biome) | Our value | Why |
|--------|-----------------|-----------|-----|
| `formatter.indentStyle` | `"tab"` | **`"space"`** | Matches `.editorconfig` and team preference |
| `formatter.indentWidth` | `2` | **`4`** | Team preference for readability |
| `formatter.lineWidth` | `80` | **`120`** | Angular templates with decorators need width |
| `javascript.formatter.quoteStyle` | `"double"` | **`"single"`** | Matches current Prettier config |
| `javascript.parser.unsafeParameterDecoratorsEnabled` | `false` | **`true`** | Required for Angular `@Inject()` parameter decorators |
| `vcs.enabled` | `false` | **`true`** | Respect `.gitignore`, skip `node_modules` |
| `formatter.formatWithErrors` | `false` | **`true`** | Allow formatting files with syntax errors (lint catches them) |
| `json.parser.allowComments` | `false` | **`true`** | Support JSONC files like `tsconfig.json`, VS Code settings |
| `files.ignoreUnknown` | `false` | **`true`** | Don't error on unknown file types in the project |

**Overrides**:
- Test files (`*.spec.ts`, `*.test.ts`): `noNonNullAssertion: "off"` — non-null assertions are common in test setup (mocks, fixtures). Per Biome docs, overrides use `includes` with glob patterns.
- `dist/` and `.angular/` excluded via `files.includes` negated patterns (`!!**/dist` uses force-ignore to skip indexing entirely)

**Rationale**: 
- `biome.json` is the official default filename from `biome init`; JSONC syntax is natively supported (Biome detects comments automatically)
- `$schema` provides IntelliSense in VS Code and JetBrains when editing the config
- VCS integration (`useIgnoreFile: true`) makes `files.includes: ["**"]` safe — `node_modules` and `.git` are automatically excluded via `.gitignore`
- `unsafeParameterDecoratorsEnabled: true` is critical for Angular constructor DI patterns
- Biome's configuration reference ([biomejs.dev/reference/configuration](https://biomejs.dev/reference/configuration)) confirms all options above

**Alternatives considered**:
- *`biome.jsonc`*: Also supported by Biome (`.jsonc` extension), but `biome.json` is the default from `biome init` and is more widely recognized by editors
- *Using `formatter.useEditorconfig: true`*: Would pick up `.editorconfig` settings, but Biome defaults (`tab` indent, `80` width, `double` quotes) would then need to be overridden in both places. Setting everything in `biome.json` is simpler and more explicit.

### D6: Lefthook Configuration Layout

**Decision**: Single `lefthook.yml` at project root with two hooks:

```yaml
pre-commit:
  parallel: false
  commands:
    biome-format:
      run: bun biome check --write --no-errors-on-unmatched {staged_files}
      stage_fixed: true
    biome-lint:
      run: bun biome check --no-errors-on-unmatched {staged_files}

commit-msg:
  commands:
    commitlint:
      run: bun commitlint --edit {1}
```

**Rationale**: 
- `stage_fixed: true` is Lefthook's built-in mechanism to re-add files modified by the command (only works for `pre-commit` per official docs). After `biome check --write` auto-fixes and re-stages, the second `biome check` verifies no remaining issues exist on the corrected files.
- `parallel: false` ensures sequential execution: format → re-stage → lint check. This prevents a race condition where the lint check runs on the original unstaged files.
- `{staged_files}` is Lefthook's template variable for all staged files (official docs shorthand).
- `{1}` is Lefthook's template for the first git hook argument — the `commit-msg` hook receives the path to `.git/COMMIT_EDITMSG` as its first argument. The official Lefthook docs and commitlint example use `{1}`, **not** `$1` (which is shell syntax, not Lefthook template syntax).

**Alternatives considered**:
- *Single command with only `biome check --write`*: Would auto-fix but not block on remaining non-auto-fixable errors.
- *Using `$1` instead of `{1}`*: Shell variable syntax, not supported by Lefthook's template engine. The official docs consistently use `{1}`, `{2}`, etc. for git hook positional arguments.
- *`jobs:` instead of `commands:`*: `jobs` uses a list format and supports groups. `commands` uses named entries which is more readable for simple configurations. Both are valid per official docs.

### D7: npm Scripts Design

**Decision**: Add seven scripts to `package.json`:

- `format`: `biome check --write .` — format, lint-safe-fix, and organize imports on all files
- `format:check`: `biome check .` — check format + lint without modifying (local use)
- `lint`: `biome lint .` — lint only, no format check, no fixes
- `ci`: `biome ci .` — CI-optimized check (same as `check` but non-interactive, exits non-zero on issues)
- `prepare`: `lefthook install` — auto-install git hooks on `bun install`
- `changelog`: `conventional-changelog -p angular` — generate CHANGELOG.md since last semver tag
- `changelog:first`: `conventional-changelog -p angular -r 0` — generate full CHANGELOG.md from all history
- `version`: `conventional-changelog -p angular && git add CHANGELOG.md` — pre-version hook (auto-runs on `bun version`)

**Rationale**: `prepare` is the standard npm lifecycle hook that runs after `install`. The `version` script runs before `npm version` (or `bun version`) and ensures CHANGELOG.md is always regenerated and committed alongside the version bump.

### D8: Conventional Changelog with Angular Preset

**Decision**: Install `conventional-changelog` (v7.2.0, the main CLI from the [conventional-changelog monorepo](https://github.com/conventional-changelog/conventional-changelog)) with the Angular preset (`-p angular`). This is the package published on npm as `conventional-changelog`, not the sub-package `conventional-changelog-angular` (which is only a parser preset).

**Tool**: `conventional-changelog` (npm: `conventional-changelog`, bin: `conventional-changelog`).

**Integration points**:
1. **Manual generation**: `bun run changelog` generates CHANGELOG.md from commits since the last semver tag:
   ```bash
   conventional-changelog -p angular
   ```
2. **First release / full history**: Set `releaseCount` to `0` to regenerate all changelogs from the entire history:
   ```bash
   conventional-changelog -p angular -r 0
   ```
3. **Pre-version hook**: `version` script in `package.json` runs changelog generation and stages CHANGELOG.md before `bun version`. This is the official recommended workflow from the README:
   ```json
   "scripts": {
     "changelog": "conventional-changelog -p angular",
     "changelog:first": "conventional-changelog -p angular -r 0",
     "version": "conventional-changelog -p angular && git add CHANGELOG.md"
   }
   ```
4. **`.npmrc` configuration** for automated commit messages and tag prefix on version bump:
   ```
   tag-version-prefix=""
   message="chore(release): %s :tada:"
   ```
5. **Lefthook post-commit** (optional): validates commit messages are parseable, catching malformed messages early

**Workflow**:
```bash
# Initial setup: generate full changelog from all history
bun run changelog:first
git add CHANGELOG.md && git commit -m "📝 docs: add initial CHANGELOG.md"

# Regular release flow:
bun version patch    # → "version" script fires → changelog → stage → bump → tag
# or
bun version minor    # → same flow for minor releases
# or
bun version major    # → same flow for major releases
```

**Rationale**:
- `conventional-changelog` is the main, most-downloaded CLI package published on npm (the monorepo root README also documents this as the primary tool)
- `-p angular` loads `conventional-changelog-angular` as the preset (it's installed as a dependency, not separately)
- `standard-changelog` is an alternative pre-configured wrapper, but `conventional-changelog` gives more control and is the canonical approach documented in the official README
- The `version` npm script hook integrates seamlessly with `bun version`, ensuring CHANGELOG.md is always regenerated and staged alongside the version bump
- The `.npmrc` `tag-version-prefix=""` removes the `v` prefix from tags (cleaner semver), and the `message` config auto-generates the release commit message

**Alternatives considered**:
- *`standard-changelog`*: Pre-configured wrapper with Angular preset, no `-p angular` flag needed. Simpler but less flexible. `conventional-changelog` is the canonical tool.
- *`conventional-changelog-angular`*: This is only a parser preset (used internally by `-p angular`), not a CLI. Cannot be used standalone.
- *`commit-and-tag-version`*: Drop-in replacement for `npm version` that handles bump + changelog + tag. More opinionated. `conventional-changelog` + `version` script achieves the same with fewer abstractions.
- *`semantic-release`*: Fully automated CI publishing. Overkill for the current project with no CI pipeline.

### D9: GitHub Actions CI/CD Pipeline

**Decision**: Create a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on every push to `main` and every pull request. The workflow validates code quality using the same toolchain configured locally (Biome, TypeScript, Vitest), ensuring CI and local environments are consistent.

**Workflow file**: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: "1.3.13"

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Biome check (format + lint)
        run: bun biome ci .

      - name: TypeScript type check
        run: bun tsc --noEmit

  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: "1.3.13"

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run tests
        run: bun run test
```

**Job breakdown**:

| Job | What it does | Command | Blocks on |
|-----|-------------|---------|-----------|
| `quality` | Format + lint + type-check | `biome ci .` → `tsc --noEmit` | — |
| `test` | Run Vitest test suite | `bun run test` | `quality` passes |

**Key design decisions**:

- **`biome ci .` over `biome check .`**: `biome ci` is the official CI-optimized command (non-interactive, same logic as `check` but exits non-zero on any issue). This matches Biome's [Continuous Integration recipe](https://biomejs.dev/recipes/continuous-integration/).
- **`bun install --frozen-lockfile`**: Ensures CI uses the exact locked versions from `bun.lockb`. Fails if `bun.lockb` is out of sync with `package.json` — catches mismatches early.
- **`oven-sh/setup-bun@v2`**: Official GitHub Action for Bun. Pins Bun version to match `package.json`'s `packageManager: "bun@1.3.13"`.
- **`needs: quality`**: Tests only run if quality checks pass. Saves CI minutes on failed lint/format commits. The `quality` job also installs dependencies, so Angular build tools are available for `tsc --noEmit`.
- **Trigger on `push: [main]` and `pull_request: [main]`**: Catches issues on direct pushes and PR validation. No trigger on feature branches to avoid redundant runs (PR already covers them).

**Rationale**:
- Bi-directional consistency: the same Biome config (`biome.json`) is used in CI, Lefthook pre-commit, VS Code extension, and CLI scripts. No divergence is possible.
- Vitest is already configured as the project test runner (`ng test` uses Vitest via Angular CLI builder). Running `bun run test` executes the Angular test setup.
- `tsc --noEmit` catches TypeScript errors that Biome's linter doesn't cover (type mismatches, missing imports).
- The two-job structure (`quality` → `test`) is the standard pattern: fast feedback on lint/format failures, then full test suite on success.

**Alternatives considered**:
- *Single job with all steps*: Simpler but wastes CI minutes running tests when lint fails. Separate jobs with `needs` provides faster failure feedback.
- *Matrix strategy for Node versions*: Overkill for an Angular frontend project with a fixed Bun version. Can be added later if the project grows.
- *`actions/cache` for Bun dependencies*: `oven-sh/setup-bun@v2` has built-in caching. No additional config needed.

## Risks / Trade-offs

### Risk: Biome HTML formatter produces large diffs
**Mitigation**: Run `biome check --write` once on the entire codebase before enabling hooks. Review the diff carefully. If specific Angular template patterns break, adjust Biome HTML formatter rules or add `<!-- biome-ignore -->` comments in exceptional cases.

### Risk: Biome false positives on Angular decorator syntax
**Mitigation**: Disable specific lint rules that conflict with Angular patterns (e.g., `useLiteralEnumMembers` may flag Angular's `@Component` metadata). Document disabled rules in `biome.json` comments.

### Risk: 4-space + 120-width may cause team disagreement
**Mitigation**: These values are explicitly documented in this design and enforced by tooling. If the team later prefers different values, it's a one-line change in `biome.json` followed by `bun run format`.

### Risk: Biome defaults differ significantly from expected values
**Mitigation**: Biome defaults to `"tab"` indent, `80` line width, and `"double"` quotes. Our `biome.json` explicitly overrides all three (`"space"`, `120`, `"single"`). This is done at the top-level `formatter` and per-language `javascript.formatter`/`css.formatter`/`html.formatter` sections to ensure consistency. The `biome init` command generates a baseline config but does not set language-specific options — manual review is required.

### Risk: commitlint emoji rule may slow adoption
**Mitigation**: Provide a clear table of emoji-to-type mappings in the project documentation. The commit-msg hook error message must include the mapping. Consider a helper script or git alias for emoji insertion.

### Risk: Lefthook adds latency to commits
**Mitigation**: Biome is fast (Rust-based), and Lefthook only runs on staged files, not the entire codebase. Expected overhead: <2 seconds per commit. If performance becomes an issue, Lefthook supports `parallel: true` and file grouping.

### Risk: `prepare` script may fail in CI
**Mitigation**: The `prepare` script calls `lefthook install`, which is a no-op if `.git` is not present (e.g., in Docker builds). CI environments that mount source without `.git` will skip hook installation gracefully.

### Risk: conventional-changelog requires semver tags to function correctly
**Mitigation**: `-r 0` flag handles the initial case without tags by regenerating the full history. After the first release, ensure tags follow semver (e.g. `1.0.0`, no `v` prefix). Configure `.npmrc` with `tag-version-prefix=""` to match. Commits without conventional format are skipped gracefully by the parser.

### Risk: GitHub Actions runner may lack Angular build prerequisites
**Mitigation**: The `quality` job runs `bun install` before `tsc --noEmit`, which installs all Angular devDependencies including `@angular/compiler-cli`. Ubuntu runners (`ubuntu-latest`) have all native build tools pre-installed. If issues arise, add `sudo apt-get install -y build-essential` as a pre-step.

## Migration Plan

1. **Install tools**: `bun add -d @biomejs/biome lefthook @commitlint/cli @commitlint/config-conventional conventional-changelog`
2. **Remove Prettier**: `bun remove prettier` and delete `.prettierrc`
3. **Create configs**: Write `biome.json`, `lefthook.yml`, `commitlint.config.ts`
4. **Update `.editorconfig`**: Change `indent_size` to 4
5. **Initial format**: Run `bun run format` on entire codebase, review diff, commit
6. **Install hooks**: Run `bun run prepare`
7. **Generate initial changelog**: Run `bun run changelog` and commit `CHANGELOG.md`
8. **Create CI workflow**: Create `.github/workflows/ci.yml` and push to verify it triggers on the PR
9. **Validate**: Test commit workflow end-to-end with a sample change

**Rollback**: Revert to Prettier by restoring `.prettierrc` and `prettier` dependency, removing new configs, and running `lefthook uninstall`.

## Open Questions

- Should the emoji rule be a hard block (error) or a soft warning initially during adoption?
- Should SCSS files use separate indentation from TypeScript (2-space is common in SCSS communities)?
- Should `max_line_length = off` be kept for `.md` files in `.editorconfig` to prevent markdown wrapping?
- Should `conventional-changelog` use `-r 0` (full history) or `-r 1` (since last tag) on first run?
- Should a `post-commit` Lefthook hook validate that the commit message is parseable by conventional-changelog?
