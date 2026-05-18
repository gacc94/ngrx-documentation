import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { MovieStore } from '@features/movies/application/movie.store';
import type { MovieCategoryKey } from '@features/movies/infrastructure/movie.api';
import { MovieCardComponent } from '../../components/movie-card/movie-card';
import { MovieCarouselComponent } from '../../components/movie-carousel/movie-carousel';

const CATEGORY_KEYS: MovieCategoryKey[] = ['now_playing', 'popular', 'top_rated', 'upcoming'];

@Component({
    selector: 'app-movie-list',
    imports: [MovieCarouselComponent, MovieCardComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './movie-list.page.scss',
    template: `
        <div class="movie-list">
            <header class="movie-list-header">
                <h1 class="movie-list-title">Movies</h1>
                <p class="movie-list-subtitle">Discover the latest and greatest films</p>
            </header>

            <app-movie-carousel
                title="Now Playing"
                [loadingMore]="store.loadingMore()['now_playing']"
                [hasMore]="!store.totalPages()['now_playing'] || store.currentPage()['now_playing'] < store.totalPages()['now_playing']"
                (nearEnd)="store.loadMore('now_playing')"
            >
                @for (movie of store.nowPlaying(); track movie.id) {
                    <app-movie-card [movie]="movie" />
                } @empty {
                    <div class="loading-cards">
                        @for (i of skeletonArray; track i) {
                            <div class="skeleton-card"></div>
                        }
                    </div>
                }
            </app-movie-carousel>

            <app-movie-carousel
                title="Popular"
                [loadingMore]="store.loadingMore()['popular']"
                [hasMore]="!store.totalPages()['popular'] || store.currentPage()['popular'] < store.totalPages()['popular']"
                (nearEnd)="store.loadMore('popular')"
            >
                @for (movie of store.popular(); track movie.id) {
                    <app-movie-card [movie]="movie" />
                } @empty {
                    <div class="loading-cards">
                        @for (i of skeletonArray; track i) {
                            <div class="skeleton-card"></div>
                        }
                    </div>
                }
            </app-movie-carousel>

            <app-movie-carousel
                title="Top Rated"
                [loadingMore]="store.loadingMore()['top_rated']"
                [hasMore]="!store.totalPages()['top_rated'] || store.currentPage()['top_rated'] < store.totalPages()['top_rated']"
                (nearEnd)="store.loadMore('top_rated')"
            >
                @for (movie of store.topRated(); track movie.id) {
                    <app-movie-card [movie]="movie" />
                } @empty {
                    <div class="loading-cards">
                        @for (i of skeletonArray; track i) {
                            <div class="skeleton-card"></div>
                        }
                    </div>
                }
            </app-movie-carousel>

            <app-movie-carousel
                title="Upcoming"
                [loadingMore]="store.loadingMore()['upcoming']"
                [hasMore]="!store.totalPages()['upcoming'] || store.currentPage()['upcoming'] < store.totalPages()['upcoming']"
                (nearEnd)="store.loadMore('upcoming')"
            >
                @for (movie of store.upcoming(); track movie.id) {
                    <app-movie-card [movie]="movie" />
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
