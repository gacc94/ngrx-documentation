import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-hero-section',
    imports: [RouterLink, MatButtonModule, MatIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './hero-section.scss',
    template: `
        <section class="hero">
            <div class="hero-content">
                <h1 class="hero-title">Discover Your Next<br />Favorite Movie</h1>
                <p class="hero-subtitle">
                    Explore thousands of movies, from blockbusters to hidden gems. Powered by The Movie Database.
                </p>
                <div class="hero-actions">
                    <a mat-raised-button routerLink="/movies" class="hero-cta">
                        <mat-icon fontIcon="play_arrow" />
                        Browse Movies
                    </a>
                    <a mat-stroked-button routerLink="/movies" class="hero-secondary">
                        <mat-icon fontIcon="trending_up" />
                        Popular Now
                    </a>
                </div>
            </div>
        </section>
    `,
})
export class HeroSectionComponent {}
