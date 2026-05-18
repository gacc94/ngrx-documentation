import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { MovieImagePipe } from '@features/movies/application/movie-image.pipe';
import type { Movie } from '@features/movies/domain/movie.model';
import { MovieApi } from '@features/movies/infrastructure/movie.api';
import { debounceTime, distinctUntilChanged, filter, of, switchMap, tap } from 'rxjs';

@Component({
    selector: 'app-search-bar',
    imports: [
        FormsModule,
        MatAutocompleteModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MovieImagePipe,
        DatePipe,
        DecimalPipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './search-bar.scss',
    template: `
        <mat-form-field
            class="search-field"
            appearance="fill"
            subscriptSizing="dynamic"
            (click)="$event.stopPropagation()"
        >
            <mat-icon matPrefix fontIcon="search" class="search-icon" />
            <input
                matInput
                type="search"
                placeholder="Search movies..."
                [matAutocomplete]="auto"
                [(ngModel)]="query"
                (input)="onInput()"
                (focus)="opened.set(true)"
                (blur)="opened.set(false)"
            />
            @if (query()) {
                <button matSuffix mat-icon-button (click)="clear()">
                    <mat-icon fontIcon="close" />
                </button>
            }
            <mat-autocomplete
                #auto="matAutocomplete"
                [displayWith]="displayFn"
                (optionSelected)="onSelected($event.option.value)"
            >
                @if (loading()) {
                    <mat-option disabled class="searching-option">
                        <mat-spinner diameter="20" />
                        <span>Searching...</span>
                    </mat-option>
                }
                @for (movie of results(); track movie.id) {
                    <mat-option [value]="movie" class="movie-option">
                        <div class="movie-option-content">
                            @if (movie.posterPath) {
                                <img
                                    [src]="movie.posterPath | movieImage: 'w92'"
                                    [alt]="movie.title"
                                    class="option-poster"
                                />
                            } @else {
                                <div class="option-no-poster">
                                    <mat-icon fontIcon="movie" />
                                </div>
                            }
                            <div class="option-info">
                                <span class="option-title">{{ movie.title }}</span>
                                <span class="option-meta">
                                    {{ movie.releaseDate | date: 'yyyy' }}
                                    <span class="option-rating">⭐ {{ movie.voteAverage | number: '1.1-1' }}</span>
                                </span>
                            </div>
                        </div>
                    </mat-option>
                } @empty {
                    @if (query().length >= 2 && !loading()) {
                        <mat-option disabled>No results found</mat-option>
                    }
                }
            </mat-autocomplete>
        </mat-form-field>
    `,
})
export class SearchBarComponent {
    readonly #api = inject(MovieApi);
    readonly #router = inject(Router);
    readonly #destroyRef = inject(DestroyRef);

    protected readonly query = signal('');
    protected readonly results = signal<Movie[]>([]);
    protected readonly loading = signal(false);
    protected readonly opened = signal(false);

    protected readonly displayFn = (movie: Movie): string => movie?.title ?? '';

    onInput(): void {
        const q = this.query().trim();
        if (q.length < 2) {
            this.results.set([]);
            return;
        }

        of(q)
            .pipe(
                debounceTime(350),
                distinctUntilChanged(),
                filter((v) => v.length >= 2),
                tap(() => this.loading.set(true)),
                switchMap((v) => this.#api.search(v)),
                takeUntilDestroyed(this.#destroyRef),
            )
            .subscribe({
                next: (res) => {
                    this.results.set(res.results.slice(0, 8));
                    this.loading.set(false);
                },
                error: () => this.loading.set(false),
            });
    }

    onSelected(movie: Movie): void {
        this.query.set('');
        this.results.set([]);
        this.#router.navigate(['/movies', movie.id]);
    }

    clear(): void {
        this.query.set('');
        this.results.set([]);
    }
}
