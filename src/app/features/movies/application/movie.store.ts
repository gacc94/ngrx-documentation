import { inject } from '@angular/core';
import { QueryCacheService } from '@core/cache';
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
    loadingMore: Record<string, boolean>;
    currentPage: Record<string, number>;
    totalPages: Record<string, number>;
}

const initialState: MovieState = {
    nowPlaying: [],
    popular: [],
    topRated: [],
    upcoming: [],
    loading: {},
    loadingMore: {},
    currentPage: {},
    totalPages: {},
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
                            currentPage: { ...s.currentPage, [category]: 1 },
                            loading: { ...s.loading, [category]: false },
                        })),
                    error: () =>
                        patchState(store, (s) => ({
                            loading: { ...s.loading, [category]: false },
                        })),
                });
        },

        loadMore(category: MovieCategoryKey): void {
            const stateKey = STATE_KEY_MAP[category];
            const nextPage = (store.currentPage() as Record<string, number>)[category] + 1;
            const totalPages = (store.totalPages() as Record<string, number>)[category];

            if (totalPages && nextPage > totalPages) return;

            patchState(store, (s) => ({ loadingMore: { ...s.loadingMore, [category]: true } }));

            api.getCategory(category, nextPage)
                .pipe(map((res) => ({ movies: res.results, totalPages: res.totalPages })))
                .subscribe({
                    next: ({ movies, totalPages }) =>
                        patchState(store, (s) => ({
                            [stateKey]: [...(s[stateKey] as Movie[]), ...movies],
                            currentPage: { ...s.currentPage, [category]: nextPage },
                            totalPages: { ...s.totalPages, [category]: totalPages },
                            loadingMore: { ...s.loadingMore, [category]: false },
                        })),
                    error: () =>
                        patchState(store, (s) => ({
                            loadingMore: { ...s.loadingMore, [category]: false },
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
