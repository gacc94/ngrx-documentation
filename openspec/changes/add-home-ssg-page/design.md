## Context

The project is a pure CSR Angular SPA with no SSR/SSG setup. The root route (`''`) currently redirects to `/movies`. All pages use clean architecture with standalone components, signal-based inputs, and OnPush change detection. The build uses `@angular/build:application` (application builder).

## Goals / Non-Goals

**Goals:**
- Install `@angular/ssr` and configure static prerendering (SSG) for the Home page
- Create a static Home page with Hero, About, Contact, and Footer sections
- Keep Movies and Movie Detail pages as CSR (API-driven, no SSG)
- Add Movies navigation link in the header
- Deploy as static files served by nginx — no Node.js runtime in production

**Non-Goals:**
- No dynamic SSR at runtime (no `server.ts` running in production)
- No changes to Movie feature behavior, data fetching, cache, or prefetch
- No authentication integration on the Home page
- No i18n or multi-language support
- No Adobe Target/Experience integration

## Decisions

### D1: SSG build-time only, no SSR runtime

**Decision**: Use `@angular/ssr` exclusively for build-time prerendering. Do not deploy or run `server.ts` in production.

**Rationale**: The Home page is fully static (no API calls, no user-specific content). Prerendering generates complete HTML at build time, achieving instant FCP/LCP without the operational overhead of running a Node server. Nginx serves the static `dist/browser/` files as it does today — the only difference is that `index.html` now contains full rendered content instead of an empty `<app-root>`.

**Alternatives considered**:
- _Full SSR with runtime server_: Unnecessary complexity for one static page. Adds Node process management, connection pooling, and monitoring.
- _Scully or Analog prerendering_: These are third-party tools. `@angular/ssr` is first-party, maintained by Angular team, and provides `RenderMode.Prerender` natively.

### D2: RenderMode strategy per route

**Decision**:

```typescript
// app.routes.server.ts
{ path: '',            renderMode: RenderMode.Prerender },  // Home — SSG
{ path: 'movies',      renderMode: RenderMode.Client },     // Movie list — CSR (API calls)
{ path: 'movies/:id',  renderMode: RenderMode.Client },     // Movie detail — CSR (API calls)
{ path: '**',          renderMode: RenderMode.Client },     // Fallback
```

**Rationale**: Movie pages call TMDB API in `ngOnInit` and use `QueryCacheService` with `sessionStorage`. Prerendering them would execute those API calls at build time and freeze stale data in the HTML. Client rendering preserves the existing SWR cache behavior and ensures fresh data per visitor.

### D3: Home page composed of section components

**Decision**: Create `HomePage` as a container that composes `HeroSectionComponent`, `AboutSectionComponent`, `ContactSectionComponent`, and `FooterSectionComponent`. Each section is a standalone, OnPush, signal-free (no reactive state needed for static content).

**Rationale**: Following the existing component decomposition pattern (Movies has `MovieHero`, `MovieCarousel`, `MovieCard`). Each section has a single responsibility, inline template for small components, and can be reused independently if needed later.

**Alternatives considered**:
- _Single monolithic Home component_: Simpler but harder to maintain, violates single responsibility, and prevents section-level code splitting with `@defer`.
- _Content projection approach_: Unnecessary indirection for a static page where the composition is known at design time.

### D4: Inline templates for section components

**Decision**: Small section components use inline templates via `template:` property in the decorator. Larger sections (HomePage) use external HTML/SCSS files.

**Rationale**: Matches AGENTS.md convention: "Prefer inline templates for small components." Sections like About and Contact are 10-20 lines of markup — inline keeps them self-contained and reduces file count.

### D5: Hydration enabled for Home page

**Decision**: Add `provideClientHydration()` to `app.config.ts`. The Home page hydrates into a fully interactive Angular app after SSG serves the static HTML.

**Rationale**: Required for the Home page's navigation links and any interactive elements to function. Without hydration, Angular can't attach event listeners to the prerendered DOM. The Movies link in the header uses `routerLink`, which depends on Angular's router being hydrated.

### D6: Header navigation — logo stays as-is, add explicit Movies link

**Decision**: Keep the existing logo link (`/movies`), and add a visible "Movies" navigation item next to it. No Home link needed since the logo can navigate to `/` (Home).

**Rationale**: Users landing on `/movies` directly need a way to reach Home. From Home, the "Movies" link provides clear navigation to the dynamic feature. The logo links to `/` (Home) instead of `/movies` as it did before, since Home is now the landing page.

## Risks / Trade-offs

- **[Risk] Prerendered HTML becomes stale if static content changes** → Mitigation: The Home page content is truly static (Hero text, About description, Contact info). Changes require a new build, which is acceptable for marketing-style landing pages. Content changes are infrequent.
- **[Risk] `ng add @angular/ssr` may adjust existing project files** → Mitigation: Review all generated files and keep only what's needed for prerendering. Remove runtime server logic. Test that existing build pipeline (`ng build`) produces correct output.
- **[Risk] Increased build time due to prerendering** → Mitigation: Only one route (`''`) is prerendered. Build time increase is negligible (sub-second for a static page).
