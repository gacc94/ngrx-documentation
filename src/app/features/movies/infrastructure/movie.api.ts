import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, type Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { Movie, TmdbPaginatedResponse } from '../domain/movie.model';
import type { TmdbMovieDto } from './tmdb.dto';
import { mapTmdbMovie } from './tmdb.mapper';

export type MovieCategoryKey = 'now_playing' | 'popular' | 'top_rated' | 'upcoming';

const CATEGORY_ENDPOINTS: Record<MovieCategoryKey, string> = {
    now_playing: '/movie/now_playing',
    popular: '/movie/popular',
    top_rated: '/movie/top_rated',
    upcoming: '/movie/upcoming',
};

@Injectable({ providedIn: 'root' })
export class MovieApi {
    readonly #http = inject(HttpClient);
    readonly #baseUrl = environment.tmdbApiUrl;

    #params(): Record<string, string> {
        return { api_key: environment.tmdbApiKey };
    }

    getCategory(category: MovieCategoryKey, page = 1): Observable<TmdbPaginatedResponse<Movie>> {
        const endpoint = CATEGORY_ENDPOINTS[category];
        return this.#http
            .get<TmdbPaginatedResponse<TmdbMovieDto>>(`${this.#baseUrl}${endpoint}`, {
                params: { ...this.#params(), page },
            })
            .pipe(map((res) => ({ ...res, results: res.results.map(mapTmdbMovie) })));
    }

    getById(id: number): Observable<Movie> {
        return this.#http
            .get<TmdbMovieDto>(`${this.#baseUrl}/movie/${id}`, { params: this.#params() })
            .pipe(map(mapTmdbMovie));
    }
}
