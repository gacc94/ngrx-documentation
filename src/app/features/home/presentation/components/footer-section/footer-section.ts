import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-footer-section',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './footer-section.scss',
    template: `
        <footer class="footer">
            <div class="footer-content">
                <p class="footer-text">Made with Angular &amp; TMDB API</p>
            </div>
        </footer>
    `,
})
export class FooterSectionComponent {}
