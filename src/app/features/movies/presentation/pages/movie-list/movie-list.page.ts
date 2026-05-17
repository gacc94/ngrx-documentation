import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import type { MovieCategoryKey } from '../../../infrastructure/movie.api';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';
import { MovieCarouselComponent } from '../../components/movie-carousel/movie-carousel.component';
import { MovieStore } from '../../movie.store';

const CATEGORY_KEYS: MovieCategoryKey[] = ['now_playing', 'popular', 'top_rated', 'upcoming'];

@Component({
    selector: 'app-movie-list',
    imports: [MovieCarouselComponent, MovieCardComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="movie-list">
            <header class="movie-list-header">
                <h1>Movies</h1>
                <p>Discover the latest and greatest films</p>
            </header>

            <app-movie-carousel title="Now Playing">
                @for (movie of store.nowPlaying(); track movie.id) {
                    <app-movie-card [movie]="movie" [imageUrl]="store.imageUrl(movie.posterPath)" />
                } @empty {
                    <div class="loading-cards">
                        @for (i of skeletonArray; track i) {
                            <div class="skeleton-card"></div>
                        }
                    </div>
                }
            </app-movie-carousel>

            <app-movie-carousel title="Popular">
                @for (movie of store.popular(); track movie.id) {
                    <app-movie-card [movie]="movie" [imageUrl]="store.imageUrl(movie.posterPath)" />
                } @empty {
                    <div class="loading-cards">
                        @for (i of skeletonArray; track i) {
                            <div class="skeleton-card"></div>
                        }
                    </div>
                }
            </app-movie-carousel>

            <app-movie-carousel title="Top Rated">
                @for (movie of store.topRated(); track movie.id) {
                    <app-movie-card [movie]="movie" [imageUrl]="store.imageUrl(movie.posterPath)" />
                } @empty {
                    <div class="loading-cards">
                        @for (i of skeletonArray; track i) {
                            <div class="skeleton-card"></div>
                        }
                    </div>
                }
            </app-movie-carousel>

            <app-movie-carousel title="Upcoming">
                @for (movie of store.upcoming(); track movie.id) {
                    <app-movie-card [movie]="movie" [imageUrl]="store.imageUrl(movie.posterPath)" />
                } @empty {
                    <div class="loading-cards">
                        @for (i of skeletonArray; track i) {
                            <div class="skeleton-card"></div>
                        }
                    </div>
                }
            </app-movie-carousel>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: 24px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .movie-list-header {
            margin-bottom: 32px;

            h1 {
                margin: 0 0 4px;
                font-size: 2rem;
                font-weight: 800;
            }

            p {
                margin: 0;
                color: var(--mat-sys-on-surface-variant);
            }
        }

        .loading-cards {
            display: flex;
            gap: 16px;
        }

        .skeleton-card {
            min-width: 185px;
            max-width: 185px;
            height: 340px;
            border-radius: 12px;
            background: var(--mat-sys-surface-container-highest);
            animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
            0%,
            100% {
                opacity: 1;
            }
            50% {
                opacity: 0.4;
            }
        }
    `,
})
export class MovieListPage implements OnInit {
    protected readonly store = inject(MovieStore);
    protected readonly skeletonArray = Array.from({ length: 8 }, (_, i) => i);

    ngOnInit(): void {
        for (const key of CATEGORY_KEYS) {
            this.store.loadCategory(key);
        }
    }
}
