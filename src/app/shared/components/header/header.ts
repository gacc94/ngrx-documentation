import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { SearchBarComponent } from '../search-bar/search-bar';

@Component({
    selector: 'app-header',
    imports: [RouterLink, MatIconModule, MatIconButton, SearchBarComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './header.scss',
    template: `
        <header class="header-inner">
            <a routerLink="/movies" class="logo">
                <mat-icon fontIcon="local_movies" class="logo-icon" />
                <span class="logo-text">MovieDB</span>
            </a>

            <div class="header-right">
                <div class="search-area">
                    <app-search-bar />
                </div>

                <div class="header-actions">
                    <button mat-icon-button class="action-btn" aria-label="Account">
                        <mat-icon fontIcon="person_outline" />
                    </button>
                </div>
            </div>
        </header>
    `,
})
export class HeaderComponent {}
