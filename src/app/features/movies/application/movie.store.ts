import { inject } from '@angular/core';
import { QueryCacheService } from '@core/cache';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { concatMap, filter, map, mergeMap, pipe, tap } from 'rxjs';
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
        loadCategory: rxMethod<MovieCategoryKey>(
            pipe(
                tap((category) => patchState(store, (s) => ({ loading: { ...s.loading, [category]: true } }))),
                mergeMap((category) => {
                    const stateKey = STATE_KEY_MAP[category];
                    return cache
                        .query<Movie[]>(
                            `movies-${category}`,
                            () => api.getCategory(category).pipe(map((res) => res.results)),
                            { staleTime: 60_000, persist: true },
                        )
                        .pipe(
                            tapResponse({
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
                            }),
                        );
                }),
            ),
        ),

        loadMore: rxMethod<MovieCategoryKey>(
            pipe(
                filter((category) => {
                    const cp = (store.currentPage() as Record<string, number>)[category];
                    if (!cp) return false;
                    const nextPage = cp + 1;
                    const tp = (store.totalPages() as Record<string, number>)[category];
                    return !tp || nextPage <= tp;
                }),
                tap((category) => patchState(store, (s) => ({ loadingMore: { ...s.loadingMore, [category]: true } }))),
                concatMap((category) => {
                    const stateKey = STATE_KEY_MAP[category];
                    const nextPage = (store.currentPage() as Record<string, number>)[category] + 1;
                    return api.getCategory(category, nextPage).pipe(
                        map((res) => ({ movies: res.results, totalPages: res.totalPages })),
                        tapResponse({
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
                        }),
                    );
                }),
            ),
        ),

        prefetchCategory(category: MovieCategoryKey): void {
            cache.prefetch<Movie[]>(
                `movies-${category}`,
                () => api.getCategory(category).pipe(map((res) => res.results)),
                { staleTime: 60_000 },
            );
        },
    })),
);
