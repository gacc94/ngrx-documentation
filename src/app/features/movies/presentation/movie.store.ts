import { inject } from '@angular/core';
import { QueryCacheService } from '@app/cache';
import { environment } from '@env';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { map } from 'rxjs';
import type { Movie } from '../domain/movie.model';
import type { MovieCategoryKey } from '../infrastructure/movie.api';
import { MovieApi } from '../infrastructure/movie.api';

interface MovieState {
    nowPlaying: Movie[];
    popular: Movie[];
    topRated: Movie[];
    upcoming: Movie[];
    loading: Record<string, boolean>;
}

const initialState: MovieState = {
    nowPlaying: [],
    popular: [],
    topRated: [],
    upcoming: [],
    loading: {},
};

export const MovieStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store, api = inject(MovieApi), cache = inject(QueryCacheService)) => ({
        imageUrl(path: string | null, size: 'w500' | 'original' = 'w500'): string {
            return path ? `${environment.tmdbImageUrl}/${size}${path}` : '';
        },

        loadCategory(category: MovieCategoryKey): void {
            patchState(store, (s) => ({ loading: { ...s.loading, [category]: true } }));

            cache
                .query<Movie[]>(`movies-${category}`, () => api.getCategory(category).pipe(map((res) => res.results)), {
                    staleTime: 60_000,
                    persist: true,
                })
                .subscribe({
                    next: (movies) =>
                        patchState(store, (s) => ({
                            [category]: movies,
                            loading: { ...s.loading, [category]: false },
                        })),
                    error: () =>
                        patchState(store, (s) => ({
                            loading: { ...s.loading, [category]: false },
                        })),
                });
        },

        prefetchCategory(category: MovieCategoryKey): void {
            cache.prefetch<Movie[]>(
                `movies-${category}`,
                () => api.getCategory(category).pipe(map((res) => res.results)),
                { staleTime: 60_000 },
            );
        },
    })),
);
