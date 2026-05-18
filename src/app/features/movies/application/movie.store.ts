import { inject } from '@angular/core';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { QueryCacheService } from '@core/cache';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, type, withMethods, withState } from '@ngrx/signals';
import { entityConfig, setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { concatMap, filter, map, mergeMap, pipe, tap } from 'rxjs';
import type { Movie } from '../domain/movie.model';
import type { MovieCategoryKey } from '../infrastructure/movie.api';
import { MovieApi } from '../infrastructure/movie.api';

const nowPlayingConfig = entityConfig({
    entity: type<Movie>(),
    collection: 'nowPlaying',
});
const popularConfig = entityConfig({
    entity: type<Movie>(),
    collection: 'popular',
});
const topRatedConfig = entityConfig({
    entity: type<Movie>(),
    collection: 'topRated',
});
const upcomingConfig = entityConfig({
    entity: type<Movie>(),
    collection: 'upcoming',
});

interface PaginationState {
    loading: Record<string, boolean>;
    loadingMore: Record<string, boolean>;
    currentPage: Record<string, number>;
    totalPages: Record<string, number>;
}

const initialPagination: PaginationState = {
    loading: {},
    loadingMore: {},
    currentPage: {},
    totalPages: {},
};

const COLLECTION_MAP: Record<MovieCategoryKey, string> = {
    now_playing: 'nowPlaying',
    popular: 'popular',
    top_rated: 'topRated',
    upcoming: 'upcoming',
};

export const MovieStore = signalStore(
    { providedIn: 'root' },
    withDevtools('movies'),
    withEntities(nowPlayingConfig),
    withEntities(popularConfig),
    withEntities(topRatedConfig),
    withEntities(upcomingConfig),
    withState(initialPagination),
    withMethods((store, api = inject(MovieApi), cache = inject(QueryCacheService)) => {
        const entitiesAccessor: Record<string, () => Movie[]> = {
            // biome-ignore lint/complexity/useLiteralKeys: Angular AOT requires bracket notation for index signature properties
            nowPlaying: () => store['nowPlayingEntities']() as Movie[],
            popular: () => store['popularEntities']() as Movie[],
            topRated: () => store['topRatedEntities']() as Movie[],
            upcoming: () => store['upcomingEntities']() as Movie[],
        };

        return {
            loadCategory: rxMethod<MovieCategoryKey>(
                pipe(
                    tap((category) => patchState(store, (s) => ({ loading: { ...s.loading, [category]: true } }))),
                    mergeMap((category) => {
                        const collection = COLLECTION_MAP[category];
                        return cache
                            .query<Movie[]>(
                                `movies-${category}`,
                                () => api.getCategory(category).pipe(map((res) => res.results)),
                                { staleTime: 60_000, persist: true },
                            )
                            .pipe(
                                tapResponse({
                                    next: (movies) =>
                                        patchState(store, setAllEntities(movies, { collection }), (s) => ({
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
                        const cp = store.currentPage()[category];
                        if (!cp) return false;
                        const nextPage = cp + 1;
                        const tp = store.totalPages()[category];
                        return !tp || nextPage <= tp;
                    }),
                    tap((category) =>
                        patchState(store, (s) => ({
                            loadingMore: { ...s.loadingMore, [category]: true },
                        })),
                    ),
                    concatMap((category) => {
                        const collection = COLLECTION_MAP[category];
                        const nextPage = store.currentPage()[category] + 1;
                        return api.getCategory(category, nextPage).pipe(
                            map((res) => ({ movies: res.results, totalPages: res.totalPages })),
                            tapResponse({
                                next: ({ movies, totalPages }) => {
                                    const current = entitiesAccessor[collection]();
                                    patchState(store, setAllEntities([...current, ...movies], { collection }), (s) => ({
                                        currentPage: { ...s.currentPage, [category]: nextPage },
                                        totalPages: { ...s.totalPages, [category]: totalPages },
                                        loadingMore: { ...s.loadingMore, [category]: false },
                                    }));
                                },
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
        };
    }),
);
