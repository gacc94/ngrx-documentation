import { inject } from '@angular/core';
import { QueryCacheService } from '@app/cache';
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

const STATE_KEY_MAP: Record<MovieCategoryKey, keyof MovieState> = {
    now_playing: 'nowPlaying',
    popular: 'popular',
    top_rated: 'topRated',
    upcoming: 'upcoming',
};

export const MovieStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store, api = inject(MovieApi), cache = inject(QueryCacheService)) => ({
        loadCategory(category: MovieCategoryKey): void {
            const stateKey = STATE_KEY_MAP[category];
            patchState(store, (s) => ({ loading: { ...s.loading, [category]: true } }));

            cache
                .query<Movie[]>(`movies-${category}`, () => api.getCategory(category).pipe(map((res) => res.results)), {
                    staleTime: 60_000,
                    persist: true,
                })
                .subscribe({
                    next: (movies) =>
                        patchState(store, (s) => ({
                            [stateKey]: movies,
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
