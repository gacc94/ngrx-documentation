import { provideHttpClient, withFetch } from '@angular/common/http';
import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideDevtoolsConfig } from '@angular-architects/ngrx-toolkit';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideHttpClient(withFetch()),
        provideRouter(routes, withViewTransitions()),
        provideAnimationsAsync(),
        provideDevtoolsConfig({ name: 'NgRx Docs' }),
        provideClientHydration(
            withHttpTransferCacheOptions({
                includePostRequests: false,
                includeRequestsWithAuthHeaders: false,
            }),
        ),
    ],
};
