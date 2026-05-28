## Why

The app currently redirects from `/` to `/movies` with no landing page. Adding a static Home page prerendered via SSG provides immediate visual content, improves perceived performance (FCP/LCP), and establishes the foundation for server-side rendering in the project.

## What Changes

- Install `@angular/ssr` to enable SSG/SSR build pipeline
- Create a new static Home page with Hero, About, Contact, and Footer sections
- Configure Home (`''`) route as `RenderMode.Prerender` (SSG) — HTML generated at build time
- Configure Movies and Movie Detail routes as `RenderMode.Client` (CSR) — API-driven pages remain client-rendered
- Add navigation link to Movies in the header so users can reach the CSR pages from the prerendered Home
- Update root redirect: `''` now loads the Home component instead of redirecting to `/movies`

## Capabilities

### New Capabilities

- `home-page`: Static landing page with Hero, About, Contact, and Footer sections. Prerendered at build time (SSG). Includes navigation to the Movies feature.
- `ssg-setup`: Server-side rendering infrastructure enabling `RenderMode.Prerender` for static pages and `RenderMode.Client` for dynamic pages. Covers `@angular/ssr` installation, server routes configuration, and hydration setup.

### Modified Capabilities

- _None_ — existing Movie pages retain their current behavior; only the root route changes from a redirect to a component.

## Impact

- New dependency: `@angular/ssr` (dev/build only, no runtime server process in production)
- New files: `server.ts`, `src/main.server.ts`, `src/app/app.config.server.ts`, `src/app/app.routes.server.ts`
- Modified files: `angular.json` (add SSR builder), `src/app/app.routes.ts` (replace redirect with Home component), `src/app/app.config.ts` (add `provideClientHydration()`)
- New components: `HomePage`, `HeroSection`, `AboutSection`, `ContactSection`, `FooterSection` under `src/app/features/home/`
- Modified component: `HeaderComponent` — add Movies navigation link
- No breaking changes to existing Movie feature
