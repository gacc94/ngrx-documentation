## ADDED Requirements

### Requirement: SSG infrastructure is installed and configured
The project SHALL include `@angular/ssr` as a dev dependency. The Angular build pipeline SHALL support the `server` builder output.

#### Scenario: SSG installed via Angular CLI
- **WHEN** `ng add @angular/ssr` completes
- **THEN** `@angular/ssr` is added to `package.json` dependencies
- **AND** files `server.ts`, `src/main.server.ts`, and `src/app/app.config.server.ts` are generated
- **AND** `angular.json` contains the `"server"` builder configuration

### Requirement: Server routes define render modes per route
The project SHALL have an `app.routes.server.ts` file that maps each route to a `RenderMode`. The Home route (`''`) SHALL use `RenderMode.Prerender`. Movie routes SHALL use `RenderMode.Client`. The catch-all route SHALL use `RenderMode.Client`.

#### Scenario: Home route is prerendered
- **WHEN** the route configuration is inspected
- **THEN** path `''` has `renderMode: RenderMode.Prerender`

#### Scenario: Movie routes remain client-rendered
- **WHEN** the route configuration is inspected
- **THEN** path `'movies'` has `renderMode: RenderMode.Client`
- **AND** path `'movies/:id'` has `renderMode: RenderMode.Client`

### Requirement: Client hydration is enabled
The browser application config SHALL include `provideClientHydration()` to enable hydration of server-rendered content. HTTP requests SHALL use `withHttpTransferCacheOptions` to prevent duplicate API calls during hydration.

#### Scenario: Hydration configured in app.config.ts
- **WHEN** the application config is inspected
- **THEN** `provideClientHydration()` is present in the providers array

### Requirement: Build output supports static file deployment
The build output SHALL produce `dist/<project>/browser/` containing all static assets (HTML, JS, CSS). The output SHALL be deployable as static files via nginx without a Node.js runtime process.

#### Scenario: Build produces deployable static output
- **WHEN** `ng build` completes
- **THEN** `dist/<project>/browser/` exists with `index.html`, JavaScript bundles, and CSS files
- **AND** no runtime server process is required to serve these files

### Requirement: Existing routes and features are unaffected
Existing Movie list and Movie detail pages SHALL function identically to their pre-SSG behavior. All API calls, caching, and prefetch logic SHALL remain unchanged.

#### Scenario: Movie list page works as before
- **WHEN** user navigates to `/movies`
- **THEN** the MovieStore loads categories from TMDB API
- **AND** the cache and prefetch behavior is identical to the pre-SSG implementation

#### Scenario: Movie detail page works as before
- **WHEN** user navigates to `/movies/:id`
- **THEN** the QueryCacheService fetches or serves cached movie detail data
- **AND** the PrefetchDirective on movie cards prefetches detail data on hover
