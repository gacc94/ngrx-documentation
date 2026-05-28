## ADDED Requirements

### Requirement: Home page renders static sections
The Home page SHALL render four distinct static sections: Hero, About, Contact, and Footer. All content SHALL be hardcoded text — no API calls or dynamic data sources.

#### Scenario: User lands on Home page
- **WHEN** user navigates to `/`
- **THEN** the page displays a Hero section with a heading, subtext, and a call-to-action link
- **AND** an About section describing the app
- **AND** a Contact section with contact information
- **AND** a Footer section with copyright text

#### Scenario: Home page served as prerendered HTML
- **WHEN** the browser requests `/`
- **THEN** the HTML response contains the full rendered content inside `<app-root>`
- **AND** no loading spinner or empty state is visible before Angular hydrates

### Requirement: Home page is prerendered at build time
The Home page SHALL be generated as static HTML during the Angular build process. No runtime server SHALL be required to serve the Home page.

#### Scenario: Build output contains prerendered Home
- **WHEN** `ng build` completes
- **THEN** `dist/<project>/browser/index.html` contains the fully rendered Home page markup

### Requirement: Home page provides navigation to Movies
The Home page SHALL include a navigation link that routes users to the Movies feature (`/movies`) using Angular's `routerLink`.

#### Scenario: User clicks Movies link from Home
- **WHEN** user clicks the "Movies" navigation link in the header from the Home page
- **THEN** Angular router navigates to `/movies`
- **AND** the Movie list page loads and fetches movie data from TMDB API

### Requirement: Home page follows existing design conventions
Home page components SHALL use standalone components, `ChangeDetectionStrategy.OnPush`, and the existing project layout (header + router-outlet). Section content SHALL use inline templates for components under 20 lines of markup.

#### Scenario: Components follow project standards
- **WHEN** Home page components are inspected
- **THEN** all components use the `standalone` default (no explicit `standalone: true`)
- **AND** all components set `changeDetection: ChangeDetectionStrategy.OnPush`
- **AND** components use signal-based inputs/outputs if they have reactive state
- **AND** no `@HostBinding` or `@HostListener` decorators are used
