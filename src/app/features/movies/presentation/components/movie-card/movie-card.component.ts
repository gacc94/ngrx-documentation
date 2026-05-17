import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

import { PrefetchDirective } from '@app/cache/prefetch.directive';
import type { Movie } from '../../../domain/movie.model';
import { MovieApi } from '../../../infrastructure/movie.api';

@Component({
    selector: 'app-movie-card',
    imports: [RouterLink, MatCardModule, PrefetchDirective, DecimalPipe, DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <a
            [routerLink]="['/movies', movie().id]"
            class="movie-card-link"
            [appPrefetch]="'movie-' + movie().id"
            [appPrefetchFn]="prefetchFn"
            [appPrefetchOptions]="{ staleTime: 120_000, persist: true }"
        >
            <mat-card class="movie-card" appearance="outlined">
                @if (imageUrl()) {
                    <img mat-card-image [src]="imageUrl()" [alt]="movie().title" loading="lazy" />
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
    styles: `
        :host {
            display: block;
            min-width: 185px;
            max-width: 185px;
            flex-shrink: 0;
        }

        .movie-card-link {
            text-decoration: none;
            color: inherit;
        }

        .movie-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
            background: var(--mat-sys-surface-container);

            &:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            }
        }

        img {
            height: 278px;
            object-fit: cover;
        }

        .no-poster {
            height: 278px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--mat-sys-surface-container-highest);
            color: var(--mat-sys-on-surface-variant);
            font-size: 0.875rem;
        }

        .movie-title {
            margin: 0 0 4px;
            font-size: 0.9rem;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .movie-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            color: var(--mat-sys-on-surface-variant);
        }
    `,
})
export class MovieCardComponent {
    readonly movie = input.required<Movie>();
    readonly imageUrl = input.required<string>();

    readonly #api = inject(MovieApi);

    readonly prefetchFn = (): ReturnType<MovieApi['getById']> => this.#api.getById(this.movie().id);
}
