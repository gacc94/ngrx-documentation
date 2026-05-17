import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

import { PrefetchDirective } from '@app/cache/prefetch.directive';
import { MovieImagePipe } from '../../../application/movie-image.pipe';
import type { Movie } from '../../../domain/movie.model';
import { MovieApi } from '../../../infrastructure/movie.api';

@Component({
    selector: 'app-movie-card',
    imports: [RouterLink, MatCardModule, PrefetchDirective, MovieImagePipe, DecimalPipe, DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './movie-card.scss',
    template: `
        <a
            [routerLink]="['/movies', movie().id]"
            class="movie-card-link"
            [appPrefetch]="'movie-' + movie().id"
            [appPrefetchFn]="prefetchFn"
            [appPrefetchOptions]="{ staleTime: 120_000, persist: true }"
        >
            <mat-card class="movie-card" appearance="outlined">
                @if (movie().posterPath) {
                    <img
                        mat-card-image
                        class="poster-image"
                        [src]="movie().posterPath | movieImage: 'w500'"
                        [alt]="movie().title"
                        loading="lazy"
                    />
                } @else {
                    <div class="no-poster">
                        <span>No Poster</span>
                    </div>
                }
                <mat-card-content>
                    <h3 class="movie-title">{{ movie().title }}</h3>
                    <div class="movie-meta">
                        <span class="rating">⭐ {{ movie().voteAverage | number: '1.1-1' }}</span>
                        <span class="year">{{ movie().releaseDate | date: 'yyyy' }}</span>
                    </div>
                </mat-card-content>
            </mat-card>
        </a>
    `,
})
export class MovieCardComponent {
    readonly movie = input.required<Movie>();
    readonly #api = inject(MovieApi);

    readonly prefetchFn = (): ReturnType<MovieApi['getById']> => this.#api.getById(this.movie().id);
}
