## 1. SSG Infrastructure Setup

- [x] 1.1 Run `ng add @angular/ssr` to install dependencies and generate base files
- [x] 1.2 Create `src/app/app.routes.server.ts` defining RenderMode per route
- [x] 1.3 Add `provideClientHydration(withHttpTransferCacheOptions())` to `app.config.ts`
- [x] 1.4 Verify `angular.json` includes the `"server"` builder configuration

## 2. Home Page Components

- [x] 2.1 Create `HeroSectionComponent` with heading, subtext, and CTA link (inline template)
- [x] 2.2 Create `AboutSectionComponent` with app description text (inline template)
- [x] 2.3 Create `ContactSectionComponent` with contact info (inline template)
- [x] 2.4 Create `FooterSectionComponent` with copyright text (inline template)
- [x] 2.5 Create `HomePage` with external template composing all 4 sections
- [x] 2.6 Add SCSS styling for Home page sections consistent with existing design

## 3. Route Configuration

- [x] 3.1 Update `src/app/app.routes.ts` — replace `''` redirect with `HomePage` component
- [x] 3.2 Verify Movies routes (`/movies`, `/movies/:id`) remain lazy-loaded and unchanged

## 4. Header Navigation

- [x] 4.1 Change logo link from `/movies` to `/`
- [x] 4.2 Add "Movies" navigation link in `HeaderComponent` using `routerLink`

## 5. Build Verification

- [x] 5.1 Run `ng build` and confirm `dist/<project>/browser/index.html` contains full Home page markup
- [x] 5.2 Run `bun run lint` and confirm no errors
- [x] 5.3 Run `bun run format:check` and confirm formatting passes
- [x] 5.4 Navigate to `/` and verify Home renders without hydration errors in browser console
- [x] 5.5 Navigate from Home to `/movies` and verify Movie list still loads and fetches TMDB API
- [x] 5.6 Navigate from Movies to `/movies/:id` and verify detail page and prefetch still work
