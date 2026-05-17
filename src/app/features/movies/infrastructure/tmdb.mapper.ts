import type { Movie } from '../domain/movie.model';
import type { TmdbMovieDto } from './tmdb.dto';

export function mapTmdbMovie(dto: TmdbMovieDto): Movie {
    return {
        id: dto.id,
        title: dto.title,
        overview: dto.overview,
        posterPath: dto.poster_path,
        backdropPath: dto.backdrop_path,
        releaseDate: dto.release_date,
        voteAverage: dto.vote_average,
        voteCount: dto.vote_count,
        genreIds: dto.genre_ids,
        popularity: dto.popularity,
        originalLanguage: dto.original_language,
    };
}
