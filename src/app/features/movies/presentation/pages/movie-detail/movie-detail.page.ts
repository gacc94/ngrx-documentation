import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, type OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { QueryCacheService } from '@core/cache';
import { MovieImagePipe } from '@features/movies/application/movie-image.pipe';
import type { Movie } from '@features/movies/domain/movie.model';
import { MovieApi } from '@features/movies/infrastructure/movie.api';

@Component({
    selector: 'app-movie-detail',
    imports: [
        RouterLink,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MovieImagePipe,
        DecimalPipe,
        DatePipe,
        UpperCasePipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './movie-detail.page.scss',
    template: `
        @if (loading()) {
            <div class="loading-container">
                <mat-spinner diameter="48" />
            </div>
        } @else if (movie(); as m) {
            <div class="detail-container">
                <div
                    class="backdrop"
                    [style.background-image]="m.backdropPath ? 'url(' + (m.backdropPath | movieImage: 'original') + ')' : 'none'"
                >
                    <div class="backdrop-overlay"></div>
                </div>

                <div class="detail-content">
                    <a mat-icon-button class="back-button" routerLink="/movies">
                        <mat-icon>arrow_back</mat-icon>
                    </a>

                    <div class="detail-grid">
                        <div class="poster-column">
                            @if (m.posterPath) {
                                <img class="poster" [src]="m.posterPath | movieImage" [alt]="m.title" />
                            } @else {
                                <div class="no-poster">No Poster</div>
                            }
                        </div>

                        <div class="info-column">
                            <h1 class="movie-title">{{ m.title }}</h1>

                            <div class="meta-row">
                                <span class="rating">⭐ {{ m.voteAverage | number: '1.1-1' }} ({{ m.voteCount }} votes)</span>
                                <span class="date">{{ m.releaseDate | date: 'longDate' }}</span>
                                <span class="lang">{{ m.originalLanguage | uppercase }}</span>
                            </div>

                            @if (m.overview) {
                                <div class="overview-section">
                                    <h3 class="overview-title">Overview</h3>
                                    <p class="overview-text">{{ m.overview }}</p>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        }
    `,
})
export class MovieDetailPage implements OnInit {
    readonly #route = inject(ActivatedRoute);
    readonly #api = inject(MovieApi);
    readonly #cache = inject(QueryCacheService);

    protected readonly loading = signal(true);
    protected readonly movie = signal<Movie | null>(null);

    ngOnInit(): void {
        const id = Number(this.#route.snapshot.paramMap.get('id'));

        this.#cache
            .query<Movie>(`movie-${id}`, () => this.#api.getById(id), { staleTime: 120_000, persist: true })
            .subscribe({
                next: (data) => {
                    this.movie.set(data);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false),
            });
    }
}
