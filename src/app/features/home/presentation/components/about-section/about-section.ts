import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-about-section',
    imports: [MatIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './about-section.scss',
    template: `
        <section class="about">
            <div class="about-content">
                <h2 class="about-title">About MovieDB</h2>
                <p class="about-description">
                    MovieDB is your gateway to the world of cinema. We provide comprehensive information about movies
                    powered by The Movie Database (TMDB) API.
                </p>
                <div class="about-features">
                    <div class="feature">
                        <mat-icon fontIcon="theaters" class="feature-icon" />
                        <h3 class="feature-title">Browse</h3>
                        <p class="feature-text">Explore now playing, popular, top rated, and upcoming movies.</p>
                    </div>
                    <div class="feature">
                        <mat-icon fontIcon="search" class="feature-icon" />
                        <h3 class="feature-title">Search</h3>
                        <p class="feature-text">Find any movie instantly with our fast search feature.</p>
                    </div>
                    <div class="feature">
                        <mat-icon fontIcon="info" class="feature-icon" />
                        <h3 class="feature-title">Discover</h3>
                        <p class="feature-text">Get detailed information, ratings, and overviews for every title.</p>
                    </div>
                </div>
            </div>
        </section>
    `,
})
export class AboutSectionComponent {}
