export interface Movie {
    id: number;
    title: string;
    overview: string;
    posterPath: string | null;
    backdropPath: string | null;
    releaseDate: string;
    voteAverage: number;
    voteCount: number;
    genreIds: number[];
    popularity: number;
    originalLanguage: string;
}

export interface MovieCategory {
    key: string;
    label: string;
    movies: Movie[];
}

export interface TmdbPaginatedResponse<T> {
    page: number;
    results: T[];
    totalPages: number;
    totalResults: number;
}
