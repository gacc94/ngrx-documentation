import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, type OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { QueryCacheService } from '@app/cache';
import { environment } from '@env';
import type { Movie } from '../../../domain/movie.model';
import { MovieApi } from '../../../infrastructure/movie.api';

@Component({
    selector: 'app-movie-detail',
    imports: [
        RouterLink,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        DecimalPipe,
        DatePipe,
        UpperCasePipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (loading()) {
            <div class="loading-container">
                <mat-spinner diameter="48" />
            </div>
        } @else if (movie(); as m) {
            <div class="detail-container">
                <div
                    class="backdrop"
                    [style.background-image]="m.backdropPath ? 'url(' + imageUrl(m.backdropPath, 'original') + ')' : 'none'"
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
                                <img [src]="imageUrl(m.posterPath)" [alt]="m.title" class="poster" />
                            } @else {
                                <div class="no-poster">No Poster</div>
                            }
                        </div>

                        <div class="info-column">
                            <h1>{{ m.title }}</h1>

                            <div class="meta-row">
                                <span class="rating">⭐ {{ m.voteAverage | number: '1.1-1' }} ({{ m.voteCount }} votes)</span>
                                <span class="date">{{ m.releaseDate | date: 'longDate' }}</span>
                                <span class="lang">{{ m.originalLanguage | uppercase }}</span>
                            </div>

                            @if (m.overview) {
                                <div class="overview-section">
                                    <h3>Overview</h3>
                                    <p>{{ m.overview }}</p>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        }
    `,
    styles: `
        :host {
            display: block;
        }

        .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 60vh;
        }

        .detail-container {
            position: relative;
            min-height: 100vh;
        }

        .backdrop {
            position: absolute;
            inset: 0;
            height: 500px;
            background-size: cover;
            background-position: center top;
        }

        .backdrop-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), var(--mat-sys-background) 95%);
        }

        .detail-content {
            position: relative;
            z-index: 1;
            padding: 24px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .back-button {
            margin-bottom: 200px;
            background: rgba(0, 0, 0, 0.5);
            color: white;

            &:hover {
                background: rgba(0, 0, 0, 0.7);
            }
        }

        .detail-grid {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 32px;
        }

        .poster {
            width: 100%;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }

        .no-poster {
            width: 100%;
            aspect-ratio: 2/3;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--mat-sys-surface-container-highest);
            border-radius: 12px;
        }

        .info-column {
            padding-top: 60px;

            h1 {
                margin: 0 0 16px;
                font-size: 2.5rem;
                font-weight: 800;
                line-height: 1.2;
            }
        }

        .meta-row {
            display: flex;
            gap: 24px;
            margin-bottom: 24px;
            font-size: 0.95rem;
            color: var(--mat-sys-on-surface-variant);
        }

        .overview-section {
            margin-bottom: 16px;

            h3 {
                margin: 0 0 8px;
                font-size: 1.2rem;
                font-weight: 600;
            }

            p {
                margin: 0;
                line-height: 1.7;
                color: var(--mat-sys-on-surface-variant);
            }
        }

        @media (max-width: 768px) {
            .detail-grid {
                grid-template-columns: 1fr;
            }

            .info-column {
                padding-top: 0;

                h1 {
                    font-size: 1.75rem;
                }
            }

            .meta-row {
                flex-wrap: wrap;
                gap: 12px;
            }

            .detail-content {
                padding: 16px;
            }

            .back-button {
                margin-bottom: 160px;
            }
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

    protected imageUrl(path: string | null, size: 'w500' | 'original' = 'w500'): string {
        return path ? `${environment.tmdbImageUrl}/${size}${path}` : '';
    }
}
