import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { MovieStore } from '@features/movies/application/movie.store';
import type { MovieCategoryKey } from '@features/movies/infrastructure/movie.api';
import { MovieCardComponent } from '../../components/movie-card/movie-card';
import { MovieCarouselComponent } from '../../components/movie-carousel/movie-carousel';
import { MovieHeroComponent } from '../../components/movie-hero/movie-hero';

const CATEGORY_KEYS: MovieCategoryKey[] = ['now_playing', 'popular', 'top_rated', 'upcoming'];

const CAROUSEL_CONFIGS = [
    { id: 'now_playing' as const, title: 'Now Playing', signalKey: 'nowPlayingEntities' as const },
    { id: 'popular' as const, title: 'Popular', signalKey: 'popularEntities' as const },
    { id: 'top_rated' as const, title: 'Top Rated', signalKey: 'topRatedEntities' as const },
    { id: 'upcoming' as const, title: 'Upcoming', signalKey: 'upcomingEntities' as const },
];

@Component({
    selector: 'app-movie-list',
    imports: [MovieHeroComponent, MovieCarouselComponent, MovieCardComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './movie-list.page.scss',
    template: `
        @if (store['nowPlayingEntities']()[0]; as featured) {
            <app-movie-hero [movie]="featured" />
        } @else {
            <div class="hero-skeleton">
                <div class="hero-skeleton-inner">
                    <div class="hero-skeleton-line hero-skeleton-title"></div>
                    <div class="hero-skeleton-line hero-skeleton-meta"></div>
                    <div class="hero-skeleton-line hero-skeleton-overview"></div>
                    <div class="hero-skeleton-button"></div>
                </div>
            </div>
        }

        <div class="movie-list">
            @for (config of carouselConfigs; track config.id) {
                <app-movie-carousel
                    [title]="config.title"
                    [loadingMore]="store.loadingMore()[config.id]"
                    [hasMore]="!store.totalPages()[config.id] || store.currentPage()[config.id] < store.totalPages()[config.id]"
                    (nearEnd)="store.loadMore(config.id)"
                >
                    @for (movie of store[config.signalKey](); track movie.id) {
                        <app-movie-card [movie]="movie" />
                    } @empty {
                        <div class="loading-cards">
                            @for (i of skeletonArray; track i) {
                                <div class="skeleton-card"></div>
                            }
                        </div>
                    }
                </app-movie-carousel>
            }
        </div>
    `,
})
export class MovieListPage implements OnInit {
    protected readonly store = inject(MovieStore);
    protected readonly carouselConfigs = CAROUSEL_CONFIGS;
    protected readonly skeletonArray = Array.from({ length: 8 }, (_, i) => i);

    ngOnInit(): void {
        for (const key of CATEGORY_KEYS) {
            this.store.loadCategory(key);
        }
    }
}
