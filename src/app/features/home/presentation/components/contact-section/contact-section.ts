import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-contact-section',
    imports: [MatIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './contact-section.scss',
    template: `
        <section class="contact">
            <div class="contact-content">
                <h2 class="contact-title">Get In Touch</h2>
                <p class="contact-description">
                    Have questions or feedback? We'd love to hear from you.
                </p>
                <div class="contact-links">
                    <a href="mailto:contact@moviedb.example.com" class="contact-link">
                        <mat-icon fontIcon="mail" class="contact-icon" />
                        <span>contact&#64;moviedb.example.com</span>
                    </a>
                    <a href="https://github.com" target="_blank" rel="noopener" class="contact-link">
                        <mat-icon fontIcon="code" class="contact-icon" />
                        <span>GitHub</span>
                    </a>
                </div>
            </div>
        </section>
    `,
})
export class ContactSectionComponent {}
