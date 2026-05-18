import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { MovieImagePipe } from '@features/movies/application/movie-image.pipe';
import type { Movie } from '@features/movies/domain/movie.model';

@Component({
    selector: 'app-movie-hero',
    imports: [RouterLink, MatButtonModule, MatIconModule, MovieImagePipe, DecimalPipe, DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './movie-hero.scss',
    template: `
        <div
            class="hero-backdrop"
            [style.background-image]="'url(' + (movie().backdropPath ?? movie().posterPath | movieImage: 'original') + ')'"
        ></div>

        <div class="hero-gradient"></div>

        <div class="hero-content">
            <div class="hero-info">
                <h1 class="hero-title">{{ movie().title }}</h1>

                <div class="hero-meta">
                    <span class="hero-rating">
                        <mat-icon fontIcon="star" style="font-size: 20px; width: 20px; height: 20px" />
                        {{ movie().voteAverage | number: '1.1-1' }}
                    </span>
                    <span class="hero-year">{{ movie().releaseDate | date: 'yyyy' }}</span>
                    @if (movie().voteCount) {
                        <span class="hero-votes">{{ movie().voteCount | number }} votes</span>
                    }
                </div>

                @if (movie().overview) {
                    <p class="hero-overview">{{ movie().overview }}</p>
                }

                <div class="hero-actions">
                    <a
                        mat-raised-button
                        [routerLink]="['/movies', movie().id]"
                        class="hero-cta"
                    >
                        <mat-icon fontIcon="play_arrow" />
                        Watch Now
                    </a>
                    <a mat-stroked-button [routerLink]="['/movies', movie().id]" class="hero-more">
                        <mat-icon fontIcon="info_outline" />
                        More Info
                    </a>
                </div>
            </div>
        </div>
    `,
})
export class MovieHeroComponent {
    readonly movie = input.required<Movie>();
}
