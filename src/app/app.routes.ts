import type { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'movies',
        pathMatch: 'full',
    },
    {
        path: 'movies',
        loadComponent: () =>
            import('./features/movies/presentation/pages/movie-list/movie-list.page').then((m) => m.MovieListPage),
    },
    {
        path: 'movies/:id',
        loadComponent: () =>
            import('./features/movies/presentation/pages/movie-detail/movie-detail.page').then(
                (m) => m.MovieDetailPage,
            ),
    },
];
