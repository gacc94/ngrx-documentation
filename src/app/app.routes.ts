import type { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/presentation/pages/home/home.page').then((m) => m.HomePage),
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
