import {
    type AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    type ElementRef,
    inject,
    input,
    output,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { interval, takeWhile } from 'rxjs';

const SCROLL_END_THRESHOLD_PX = 800;

@Component({
    selector: 'app-movie-carousel',
    imports: [MatIconModule, MatIconButton, MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './movie-carousel.scss',
    template: `
        <div class="carousel-container">
            <div class="carousel-header">
                <h2 class="carousel-title">{{ title() }}</h2>
                <div class="carousel-controls">
                    <button mat-icon-button (click)="scrollLeft()" [disabled]="atStart">
                        <mat-icon>chevron_left</mat-icon>
                    </button>
                    <button mat-icon-button (click)="scrollRight()" [disabled]="atEnd && !hasMore()">
                        <mat-icon>chevron_right</mat-icon>
                    </button>
                </div>
            </div>
            <div class="carousel-track-wrapper">
                <div
                    #track
                    class="carousel-track"
                    (scroll)="onScroll()"
                    (mouseenter)="pauseAuto()"
                    (mouseleave)="resumeAuto()"
                >
                    <ng-content />
                    @if (loadingMore()) {
                        <div class="loading-more-indicator">
                            @for (i of loadingSkeletonArray; track i) {
                                <div class="skeleton-card"></div>
                            }
                        </div>
                    }
                </div>
                @if (loadingMore()) {
                    <div class="loading-more-overlay">
                        <mat-spinner diameter="32" />
                    </div>
                }
            </div>
        </div>
    `,
})
export class MovieCarouselComponent implements AfterViewInit {
    readonly title = input.required<string>();
    readonly autoScroll = input(true);
    readonly loadingMore = input(false);
    readonly hasMore = input(true);

    readonly nearEnd = output<void>();

    readonly track = viewChild.required<ElementRef<HTMLDivElement>>('track');

    protected atStart = true;
    protected atEnd = false;
    protected readonly loadingSkeletonArray = [0, 1, 2, 3];

    readonly #destroyRef = inject(DestroyRef);
    #autoScrollActive = true;
    #lastEmittedNearEnd = false;

    ngAfterViewInit(): void {
        if (this.autoScroll()) {
            interval(3000)
                .pipe(
                    takeWhile(() => this.#autoScrollActive),
                    takeUntilDestroyed(this.#destroyRef),
                )
                .subscribe(() => {
                    const el = this.track().nativeElement;
                    const remaining = el.scrollWidth - el.scrollLeft - el.clientWidth;

                    if (remaining <= SCROLL_END_THRESHOLD_PX) {
                        if (!this.#lastEmittedNearEnd && this.hasMore()) {
                            this.#lastEmittedNearEnd = true;
                            this.nearEnd.emit();
                        }
                        return;
                    }

                    el.scrollBy({ left: 201, behavior: 'smooth' });
                });
        }
    }

    scrollLeft(): void {
        this.track().nativeElement.scrollBy({ left: -400, behavior: 'smooth' });
    }

    scrollRight(): void {
        this.track().nativeElement.scrollBy({ left: 400, behavior: 'smooth' });
    }

    onScroll(): void {
        const el = this.track().nativeElement;
        this.atEnd = el.scrollLeft + el.clientWidth + 1 >= el.scrollWidth;
        this.atStart = el.scrollLeft <= 1;

        const remaining = el.scrollWidth - el.scrollLeft - el.clientWidth;
        if (remaining <= SCROLL_END_THRESHOLD_PX && !this.#lastEmittedNearEnd && this.hasMore()) {
            this.#lastEmittedNearEnd = true;
            this.nearEnd.emit();
        }

        if (remaining > SCROLL_END_THRESHOLD_PX + 201) {
            this.#lastEmittedNearEnd = false;
        }
    }

    pauseAuto(): void {
        this.#autoScrollActive = false;
    }

    resumeAuto(): void {
        this.#autoScrollActive = true;
    }
}
