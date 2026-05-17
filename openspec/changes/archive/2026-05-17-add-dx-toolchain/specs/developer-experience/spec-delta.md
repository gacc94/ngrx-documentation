# Spec Delta: Developer Experience Toolchain

This file contains specification changes for `openspec/specs/developer-experience/spec.md`.

## ADDED Requirements

### Requirement: Automated Code Formatting
WHEN staged files are committed,
the system SHALL automatically format them according to the project's Biome configuration.

#### Scenario: Pre-commit Formatting
GIVEN a developer has staged a TypeScript file with inconsistent indentation
WHEN the developer runs `git commit`
THEN Biome formats the staged file to match project standards
AND the commit proceeds if formatting succeeds

#### Scenario: Format Check Without Commit
GIVEN a developer wants to verify formatting without committing
WHEN the developer runs `bun run format:check`
THEN Biome checks all project files and reports any formatting violations
AND exits with a non-zero code if violations exist

#### Scenario: Manual Format All Files
GIVEN the codebase has formatting inconsistencies
WHEN the developer runs `bun run format`
THEN Biome formats all project files in place
AND reports the number of fixes applied

### Requirement: Automated Linting
WHEN staged files are committed,
the system SHALL lint them and block the commit on errors.

#### Scenario: Pre-commit Lint Blocking
GIVEN a developer has staged a TypeScript file with a lint error (e.g., unused variable)
WHEN the developer runs `git commit`
THEN Biome reports the lint error
AND the commit is blocked

#### Scenario: Pre-commit Lint Passing
GIVEN a developer has staged a TypeScript file with no lint errors
WHEN the developer runs `git commit`
THEN Biome reports no lint errors
AND the commit proceeds

#### Scenario: Manual Lint Check
GIVEN a developer wants to check for lint errors
WHEN the developer runs `bun run lint`
THEN Biome lints all project files
AND reports all violations found

### Requirement: Conventional Commit Enforcement
WHEN a commit message is created,
the system SHALL validate it follows the Conventional Commits format.

#### Scenario: Valid Commit Message
GIVEN a developer writes commit message "feat: add user authentication"
WHEN the `commit-msg` hook executes
THEN Commitlint accepts the message
AND the commit proceeds

#### Scenario: Invalid Commit Message
GIVEN a developer writes commit message "added some stuff"
WHEN the `commit-msg` hook executes
THEN Commitlint rejects the message
AND the commit is blocked
AND an error message explains the required format

#### Scenario: Valid Commit with Scope
GIVEN a developer writes commit message "fix(deps): update angular to v21.2.10"
WHEN the `commit-msg` hook executes
THEN Commitlint accepts the message

#### Scenario: Valid Breaking Change
GIVEN a developer writes commit message "feat!: drop support for Node 18"
WHEN the `commit-msg` hook executes
THEN Commitlint accepts the breaking change notation

### Requirement: Git Hooks Automation
WHEN the project is cloned or dependencies are installed,
the system SHALL ensure Lefthook git hooks are configured.

#### Scenario: Automatic Hook Installation
GIVEN a developer runs `bun install` after cloning the repository
WHEN the `prepare` lifecycle script executes
THEN Lefthook installs the git hooks into `.git/hooks/`
AND the hooks are ready for subsequent commits

#### Scenario: Manual Hook Installation
GIVEN hooks are not installed
WHEN the developer runs `bun run prepare`
THEN Lefthook installs the git hooks

### Requirement: Editor-Agnostic Configuration
WHEN the Biome configuration is defined,
the system SHALL use a `biome.jsonc` file that editors can discover automatically.

#### Scenario: VS Code Integration
GIVEN a developer opens the project in VS Code with the Biome extension
WHEN the editor detects `biome.jsonc` in the project root
THEN the editor uses Biome for formatting and linting
AND matches the same rules enforced by git hooks

#### Scenario: CLI Consistency
GIVEN a developer runs `biome check` in the terminal
WHEN Biome reads the `biome.jsonc` configuration
THEN the same rules apply as in-editor formatting
AND results are identical regardless of environment

### Requirement: Test File Relaxation
WHEN linting test files,
the system SHALL relax strict rules that are unnecessary or counterproductive in test contexts.

#### Scenario: Non-null Assertions in Tests
GIVEN a test file uses non-null assertions (`!`) for test setup
WHEN Biome lints the test file
THEN the `noNonNullAssertion` rule is not enforced
AND the test file passes lint

#### Scenario: Explicit Any in Tests
GIVEN a test file uses `any` for mock objects
WHEN Biome lints the test file
THEN the `noExplicitAny` rule is not enforced
AND the test file passes lint

---

## Notes

- Biome replaces Prettier entirely; Prettier dependency and `.prettierrc` are removed
- Lefthook is preferred over Husky for its speed (Rust-based) and simpler configuration
- Commitlint uses `@commitlint/config-conventional` as the base ruleset
- All tools are configured to use Bun as the runtime (`bun biome`, `bun lefthook`, etc.)
