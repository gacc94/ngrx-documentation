
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Toolchain

This project uses the following tools for code quality and consistency:

### Code Formatting & Linting (Biome)

Format and lint with [Biome](https://biomejs.dev/). Prettier has been removed.

- **Format**: `bun run format` — auto-formats all files (4-space indent, 120-char width, single quotes, LF line endings)
- **Check**: `bun run format:check` — verifies formatting without modifying files
- **Lint**: `bun run lint` — runs linter only
- **CI**: `bun ci` — CI-optimized check (use in GitHub Actions)

Configuration: `biome.json` at project root.

### Git Hooks (Lefthook)

[Lefthook](https://lefthook.dev/) manages git hooks automatically (installed via `bun install`).

- **pre-commit**: Formats staged files with Biome, auto-fixes lint issues, re-stages fixed files. Blocks commit on remaining errors.
- **commit-msg**: Validates commit messages follow Conventional Commits with emoji prefixes.

Run hooks manually: `bun lefthook run pre-commit`

### Commit Messages (Commitlint)

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) with emoji prefixes:

```
✨ feat: add new feature
🐛 fix: resolve bug
👷 ci: update CI pipeline
📝 docs: update documentation
🎨 style: format code
♻️ refactor: restructure module
⚡ perf: improve performance
✅ test: add tests
🔧 chore: maintenance task
📦 build: dependency update
⏪ revert: rollback change
```

Format: `<emoji> <type>(<scope>): <description>`

Configuration: `commitlint.config.ts`

### Changelog (conventional-changelog)

Generate `CHANGELOG.md` from commit history:

- `bun run changelog` — since last tag
- `bun run changelog:first` — full history
- `bun version patch|minor|major` — auto-generates + stages changelog before version bump

### CI/CD (GitHub Actions)

`.github/workflows/ci.yml` runs on every push/PR to `main`:
1. `quality` job: Biome check + TypeScript type check
2. `test` job: Vitest test suite
